import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Trash2, GripVertical, X, Briefcase, User } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { message } from 'antd';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ConfirmModal from '../components/ConfirmModal';

/**
 * 1. 列表項目：調用地基 .band-card 樣式
 */
const SortablePersonItem = ({ item, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      className="band-card" 
      onClick={() => onEdit(item)}
      style={{ 
        ...style, 
        display: 'flex', 
        alignItems: 'center', 
        padding: '16px 20px', 
        marginBottom: '12px',
        touchAction: 'none' // 防止手機拖拽與捲軸衝突
      }}
    >
       <div 
         {...attributes} {...listeners} 
         style={{ cursor: 'grab', padding: '8px 12px 8px 0', display: 'flex', alignItems: 'center' }}
       >
          <GripVertical size={18} color="var(--color-text-sub)" />
       </div>
       
       <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontWeight: '800', color: '#fff', fontSize: '16px' }}>{item.name}</span>
          <span style={{ fontSize: '12px', color: 'var(--color-text-sub)', fontWeight: '600' }}>{item.role || '樂團成員'}</span>
       </div>
       
       <button 
         onClick={(e) => { e.stopPropagation(); onDelete(item); }}
         style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer' }}
       >
          <Trash2 size={18} color="#ff6b6b" />
       </button>
    </div>
  );
};

const PersonnelView = ({ user, onBack }) => {
  const [items, setItems] = useState([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({ name: '', role: '' });
  const [loading, setLoading] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }));

  const fetchPersonnel = async () => {
    if (!user?.id) return;
    const { data } = await supabase.from('personnel').select('*').eq('user_id', user.id).order('sort_order', { ascending: true });
    setItems(data || []);
  };

  useEffect(() => { fetchPersonnel(); }, [user?.id]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      const newArray = arrayMove(items, oldIndex, newIndex);
      setItems(newArray);
      const updates = newArray.map((item, index) => ({ id: item.id, user_id: user.id, sort_order: index, name: item.name, role: item.role }));
      await supabase.from('personnel').upsert(updates);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (loading || !formData.name.trim()) return;
    setLoading(true);
    try {
      if (editingItem) { await supabase.from('personnel').update(formData).eq('id', editingItem.id); }
      else { await supabase.from('personnel').insert([{ ...formData, user_id: user.id, sort_order: items.length }]); }
      message.success('已儲存人員名單'); setIsSheetOpen(false); fetchPersonnel();
    } catch (err) { message.error('儲存失敗'); } finally { setLoading(false); }
  };

  const openSheet = (item = null) => {
    setEditingItem(item);
    setFormData(item ? { name: item.name, role: item.role } : { name: '', role: '' });
    setIsSheetOpen(true);
  };

  return (
    /* 關鍵：使用 flex-direction: column 確保內容不被 header 擠掉 */
    <div className="app-main-layout" style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' }}>
      
      {/* 1. 旗艦導航列：強化物理置頂與絕對置中 */}
      <header className="navbar" style={{ flexShrink: 0, position: 'relative', width: '100%' }}>
        <button onClick={onBack} className="hamburger-btn" style={{ zIndex: 10 }}>
          <ChevronLeft size={24} color="#ffffff" />
        </button>
        
        <span className="nav-brand" style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            whiteSpace: 'nowrap', fontSize: '18px', fontWeight: '900', color: '#ffffff', pointerEvents: 'none'
        }}>
            人員名單管理
        </span>
        
        <button onClick={() => openSheet()} className="navbar-add-btn" style={{ zIndex: 10 }}>
          <Plus size={24} color="#ffffff" />
        </button>
      </header>

      {/* 2. 內容容器：使用 flex: 1 與 overflow 解決內容不見的問題 */}
      <div className="content-area-wrapper" style={{ flex: 1, overflowY: 'auto' }}>
        <main className="band-container" style={{ paddingTop: '24px' }}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {items.length > 0 ? (
                  items.map(item => (
                    <SortablePersonItem key={item.id} item={item} onEdit={openSheet} onDelete={setDeleteTarget} />
                  ))
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--color-text-sub)', marginTop: '48px' }}>
                    目前尚無成員名單，點擊右上方「+」新增
                  </div>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </main>
      </div>

      {/* 3. 地基抽屜彈窗 */}
      <div className={`drawer-overlay ${isSheetOpen ? 'active' : ''}`} onClick={() => !loading && setIsSheetOpen(false)}>
        <div className="drawer-container" style={{ padding: '32px 24px' }} onClick={(e) => e.stopPropagation()}>
          <div style={{ width: '40px', height: '5px', background: '#333', borderRadius: '10px', margin: '0 auto 24px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#fff' }}>{editingItem ? "編輯人員資訊" : "新增人員名單"}</h3>
            <button onClick={() => setIsSheetOpen(false)} style={{ background: 'none', border: 'none', color: '#666' }}><X size={24}/></button>
          </div>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--color-text-sub)', fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>人員姓名</label>
              <div className="band-input-pill" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <User size={18} color="#666" />
                <input type="text" placeholder="輸入姓名" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ background: 'transparent', border: 'none', color: '#fff', width: '100%', outline: 'none' }} required />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--color-text-sub)', fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>職稱 / 樂器</label>
              <div className="band-input-pill" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Briefcase size={18} color="#666" />
                <input type="text" placeholder="例如：吉他手" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} style={{ background: 'transparent', border: 'none', color: '#fff', width: '100%', outline: 'none' }} />
              </div>
            </div>
            <button type="submit" className="band-btn-main" style={{ marginTop: '12px' }} disabled={loading}>{loading ? '正在儲存...' : '確認儲存人員'}</button>
          </form>
        </div>
      </div>

      <ConfirmModal 
        open={!!deleteTarget} title="移除人員？" content={`確定要將「${deleteTarget?.name}」從名單中移除嗎？`} 
        onCancel={() => setDeleteTarget(null)} onConfirm={async () => { await supabase.from('personnel').delete().eq('id', deleteTarget.id); setDeleteTarget(null); fetchPersonnel(); }} 
      />
    </div>
  );
};

export default PersonnelView;