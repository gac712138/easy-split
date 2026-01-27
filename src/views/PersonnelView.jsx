import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, GripVertical, X, Briefcase, User } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { message } from 'antd';
// 1. 拖曳核心組件
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ConfirmModal from '../components/ConfirmModal';

/**
 * 列表項目組件：修正手機觸控衝突與垂直對齊
 */
const SortablePersonItem = ({ item, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 1,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="person-pill-card" onClick={() => onEdit(item)}>
       {/* 手機拖曳關鍵：touch-action: none 防止與瀏覽器捲軸衝突 */}
       <div 
         {...attributes} {...listeners} 
         style={{ 
           cursor: 'grab', padding: '10px 0', marginRight: '12px', 
           display: 'flex', alignItems: 'center', touchAction: 'none' 
         }}
       >
          <GripVertical size={20} color="var(--color-text-main)" />
       </div>
       
       {/* 2. 內容區：強制內部元素垂直置中 */}
       <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ 
            fontWeight: 'bold', 
            color: 'var(--color-text-main)', 
            fontSize: '15px',
            lineHeight: '1.2' // 防止文字下推造成對齊偏差
          }}>
            {item.name}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-sub)', marginTop: '2px' }}>
            {item.role || '成員'}
          </div>
       </div>
       
       <button 
         className="delete-btn"
         onClick={(e) => { e.stopPropagation(); onDelete(item); }}
         style={{ background: 'none', border: 'none', padding: '8px', display: 'flex', alignItems: 'center' }}
       >
          <Trash2 size={18} color="var(--color-text-main)" />
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

  // 3. 修正手機端感應器：增加啟動門檻，解決手機寬度無法排序問題
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 移動超過 8px 才觸發，確保與單純點擊不衝突
      },
    })
  );

  const fetchPersonnel = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('personnel')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true });
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

      const updates = newArray.map((item, index) => ({
        id: item.id,
        user_id: user.id,
        sort_order: index,
        name: item.name,
        role: item.role
      }));
      await supabase.from('personnel').upsert(updates);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const payload = { ...formData, user_id: user.id };
    try {
      if (editingItem) {
        await supabase.from('personnel').update(payload).eq('id', editingItem.id);
      } else {
        await supabase.from('personnel').insert([{ ...payload, sort_order: items.length }]);
      }
      message.success('已儲存');
      setIsSheetOpen(false);
      fetchPersonnel();
      setFormData({ name: '', role: '' });
    } catch (err) {
      message.error('儲存失敗');
    } finally { setLoading(false); }
  };

  const openSheet = (item = null) => {
    setEditingItem(item);
    if (item) setFormData({ name: item.name, role: item.role });
    else setFormData({ name: '', role: '' });
    setIsSheetOpen(true);
  };

  return (
    <div className="app-main-layout">
      {/* 歸一化 64px 導航欄 */}
      <header className="navbar" style={{ borderBottom: 'none' }}>
        <button onClick={onBack} className="hamburger-btn">
          <ArrowLeft size={24} color="var(--color-text-main)" />
        </button>
        <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-main)' }}>
          人員名單管理
        </span>
        <button className="hamburger-btn" onClick={() => openSheet()}>
          <Plus size={24} color="var(--color-primary)" />
        </button>
      </header>

      <main className="content-area">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
            {items.map(item => (
              <SortablePersonItem key={item.id} item={item} onEdit={openSheet} onDelete={setDeleteTarget} />
            ))}
          </SortableContext>
        </DndContext>
      </main>

      {/* Bottom Sheet */}
      <div className={`modal-overlay ${isSheetOpen ? 'active' : ''}`} onClick={() => !loading && setIsSheetOpen(false)}>
        <div className="bottom-sheet" style={{ overflow: 'visible' }} onClick={(e) => e.stopPropagation()}>
          <div className="sheet-indicator"></div>
          <div className="sheet-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-text-main)' }}>
              {editingItem ? "編輯人員資訊" : "新增人員名單"}
            </h3>
            <button onClick={() => setIsSheetOpen(false)} className="hamburger-btn">
              <X size={24} color="var(--color-text-main)"/>
            </button>
          </div>
          <form onSubmit={handleSave}>
            {/* 姓名輸入 */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-text-main)' }}>人員姓名</span>
              </div>
              <input 
                type="text" placeholder="請輸入姓名" className="band-input" 
                style={{ paddingLeft: '24px' }} 
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
                required 
              />
            </div>
            {/* 職稱輸入 */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Briefcase size={18} color="var(--color-text-main)" />
                <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-text-main)' }}>職稱 / 樂器</span>
              </div>
              <input 
                type="text" placeholder="例如：吉他手" className="band-input" 
                style={{ paddingLeft: '24px' }} 
                value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} 
              />
            </div>
            <button type="submit" className="band-btn-primary" disabled={loading} style={{ color: '#ffffff', opacity: loading ? 0.7 : 1 }}>
              {loading ? '處理中...' : '確認儲存人員'}
            </button>
          </form>
        </div>
      </div>

      <ConfirmModal 
        open={!!deleteTarget} 
        title="移除人員？" 
        content={`確定要將「${deleteTarget?.name}」移除嗎？`} 
        onCancel={() => setDeleteTarget(null)} 
        onConfirm={async () => { 
          await supabase.from('personnel').delete().eq('id', deleteTarget.id); 
          setDeleteTarget(null); 
          fetchPersonnel(); 
        }} 
      />
    </div>
  );
};

export default PersonnelView;