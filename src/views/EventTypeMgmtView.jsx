import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, GripVertical, X, Palette } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { message, ColorPicker, ConfigProvider } from 'antd';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ConfirmModal from '../components/ConfirmModal';

const SortableTypeItem = ({ item, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 1,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="person-pill-card" onClick={() => onEdit(item)}>
       {/* 拖拽手把：加入 touch-action: none 修正手機無法排序問題 */}
       <div 
         {...attributes} {...listeners} 
         style={{ 
           cursor: 'grab', padding: '10px 0', marginRight: '12px', 
           display: 'flex', alignItems: 'center', touchAction: 'none' 
         }}
       >
          <GripVertical size={20} color="var(--color-text-main)" />
       </div>
       
       <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          {/* 列表色塊垂直置中 */}
          <div style={{ 
            width: '16px', height: '16px', borderRadius: '50%', 
            backgroundColor: item.primary_color || 'var(--color-primary)', 
            marginRight: '12px', flexShrink: 0 
          }} />
          <div style={{ fontWeight: 'bold', color: 'var(--color-text-main)', fontSize: '15px' }}>
            {item.name}
          </div>
       </div>
       
       <button className="delete-btn" onClick={(e) => { e.stopPropagation(); onDelete(item); }}>
          <Trash2 size={18} color="var(--color-text-main)" />
       </button>
    </div>
  );
};

const EventTypeMgmtView = ({ user, onBack, onRefresh }) => {
  const [items, setItems] = useState([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({ name: '', primary_color: '#3a8fb7' });
  const [loading, setLoading] = useState(false);

  // 感應器門檻校準
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const fetchTypes = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('categories') 
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true });
    setItems(data || []);
  };

  useEffect(() => { fetchTypes(); }, [user?.id]);

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
        primary_color: item.primary_color
      }));
      await supabase.from('categories').upsert(updates);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const colorHex = typeof formData.primary_color === 'string' 
      ? formData.primary_color 
      : formData.primary_color.toHexString();

    const payload = { 
      name: formData.name.trim(), 
      primary_color: colorHex, 
      user_id: user.id 
    };

    try {
      if (editingItem) {
        await supabase.from('categories').update(payload).eq('id', editingItem.id);
      } else {
        await supabase.from('categories').insert([{ ...payload, sort_order: items.length }]);
      }
      message.success('資料已更新');
      setIsSheetOpen(false);
      fetchTypes(); 
      if (onRefresh) onRefresh();
    } catch (err) { message.error('儲存失敗'); } finally { setLoading(false); }
  };

  const openSheet = (item = null) => {
    setEditingItem(item);
    if (item) setFormData({ name: item.name, primary_color: item.primary_color });
    else setFormData({ name: '', primary_color: '#3a8fb7' });
    setIsSheetOpen(true);
  };

  return (
    <div className="app-main-layout">
      <header className="navbar" style={{ borderBottom: 'none' }}>
        <button onClick={onBack} className="hamburger-btn">
          <ArrowLeft size={24} color="var(--color-text-main)" />
        </button>
        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>活動類型管理</span>
        <button className="hamburger-btn" onClick={() => openSheet()}>
          <Plus size={24} color="var(--color-primary)" />
        </button>
      </header>

      <main className="content-area">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
            {items.map(item => (
              <SortableTypeItem key={item.id} item={item} onEdit={openSheet} onDelete={setDeleteTarget} />
            ))}
          </SortableContext>
        </DndContext>
      </main>

      {/* Bottom Sheet：新增與編輯視窗 */}
      <div className={`modal-overlay ${isSheetOpen ? 'active' : ''}`} onClick={() => !loading && setIsSheetOpen(false)}>
        <div className="bottom-sheet" style={{ overflow: 'visible' }} onClick={(e) => e.stopPropagation()}>
          <div className="sheet-indicator"></div>
          <div className="sheet-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>類型設定</h3>
            <button onClick={() => setIsSheetOpen(false)} className="hamburger-btn"><X size={24}/></button>
          </div>

          <form onSubmit={handleSave}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '15px', fontWeight: '600' }}>類型名稱</span>
              </div>
              <input type="text" className="band-input" style={{ paddingLeft: '24px' }} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>

            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Palette size={18} color="var(--color-text-main)" />
                <span style={{ fontSize: '15px', fontWeight: '600' }}>標籤色彩</span>
              </div>
              
              <ConfigProvider theme={{ token: { zIndexPopupBase: 9999 } }}>
                <div style={{ 
                  height: '48px', display: 'flex', alignItems: 'center', 
                  width: '100%', backgroundColor: '#fff', borderRadius: '50px',
                  padding: '0 4px', border: '1px solid #333'
                }}>
                  <ColorPicker 
                    showText value={formData.primary_color}
                    onChange={(color) => setFormData({...formData, primary_color: color})}
                    getPopupContainer={(trigger) => trigger.parentElement} 
                    style={{ 
                      width: '100%', height: '100%', border: 'none', 
                      display: 'flex', alignItems: 'center', // 修正：色塊絕對垂直置中
                      padding: '0 20px', background: 'transparent'
                    }} 
                  />
                </div>
              </ConfigProvider>
            </div>

            <button type="submit" className="band-btn-primary" disabled={loading}>
              {loading ? '處理中...' : '確認儲存類型'}
            </button>
          </form>
        </div>
      </div>

      {/* 5. 修正：補上移除說明 */}
      <ConfirmModal 
        open={!!deleteTarget} 
        title="移除活動類型？" 
        content={`移除後，原本關聯「${deleteTarget?.name}」的分帳專案將會失去分類標籤，且此操作無法復原。確定要移除嗎？`} 
        onCancel={() => setDeleteTarget(null)} 
        onConfirm={async () => { 
          await supabase.from('categories').delete().eq('id', deleteTarget.id); 
          setDeleteTarget(null); 
          fetchTypes(); 
        }} 
      />
    </div>
  );
};

export default EventTypeMgmtView;