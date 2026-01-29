import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Trash2, GripVertical, X, Palette, Tag } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { message, ColorPicker, ConfigProvider } from 'antd';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ConfirmModal from '../components/ConfirmModal';

/**
 * 1. 列表項目組件
 * 修正點：釋放卡片捲動權限，僅鎖定手把拖曳
 */
const SortableTypeItem = ({ item, onEdit, onDelete }) => {
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
      }}
    >
       {/* 拖曳手把區 */}
       <div 
         {...attributes} {...listeners} 
         style={{ 
           cursor: 'grab', 
           padding: '8px 12px 8px 0', 
           display: 'flex', 
           alignItems: 'center',
           touchAction: 'none' 
         }}
       >
          <GripVertical size={18} color="var(--color-text-sub)" />
       </div>
       
       <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* 類別色彩圓點 */}
          <div style={{ 
            width: '16px', height: '16px', borderRadius: '50%', 
            backgroundColor: item.primary_color || 'var(--color-primary)', 
            boxShadow: `0 0 10px ${item.primary_color}44`
          }} />
          <span style={{ fontWeight: '800', color: '#fff', fontSize: '16px' }}>
            {item.name}
          </span>
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

// 主組件
const EventTypeMgmtView = ({ user, onBack, onRefresh }) => {
  const [items, setItems] = useState([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({ name: '', primary_color: '#3a8fb7' });
  const [loading, setLoading] = useState(false);

  // 感測器設定
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }));

  const fetchTypes = async () => {
    if (!user?.id) return;
    const { data } = await supabase.from('categories').select('*').eq('user_id', user.id).order('sort_order', { ascending: true });
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

  // ★ 核心：儲存邏輯 (包含新增與修改)
  const handleSave = async (e) => {
    e.preventDefault();
    if (loading || !formData.name.trim()) return;
    setLoading(true);
    const colorHex = typeof formData.primary_color === 'string' ? formData.primary_color : formData.primary_color.toHexString();
    const payload = { name: formData.name.trim(), primary_color: colorHex, user_id: user.id };
    
    try {
      if (editingItem) { 
        await supabase.from('categories').update(payload).eq('id', editingItem.id); 
      } else { 
        await supabase.from('categories').insert([{ ...payload, sort_order: items.length }]); 
      }
      
      message.success('已儲存帳款類型'); 
      setIsSheetOpen(false); 
      fetchTypes(); 
      
      // ★ 觸發 App.jsx 檢查分類數量，進而關閉紅點
      if (onRefresh) onRefresh();

    } catch (err) { 
      message.error('儲存失敗'); 
    } finally { 
      setLoading(false); 
    }
  };

  // ★ 核心：刪除邏輯
  const executeDelete = async () => {
    if (!deleteTarget) return;
    try {
      await supabase.from('categories').delete().eq('id', deleteTarget.id);
      message.success('已移除帳款類型');
      setDeleteTarget(null);
      fetchTypes();

      // ★ 觸發 App.jsx 重新檢查，若刪完最後一筆則紅點會重新出現
      if (onRefresh) onRefresh();

    } catch (err) {
      message.error('移除失敗');
    }
  };

  const openSheet = (item = null) => {
    setEditingItem(item);
    setFormData(item ? { name: item.name, primary_color: item.primary_color } : { name: '', primary_color: '#3a8fb7' });
    setIsSheetOpen(true);
  };

  return (
    <div className="app-main-layout" style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' }}>
      
      {/* 1. 導航列 */}
      <header className="navbar" style={{ flexShrink: 0, position: 'relative', width: '100%' }}>
        <button onClick={onBack} className="hamburger-btn" style={{ zIndex: 10 }}>
          <ChevronLeft size={24} color="#ffffff" />
        </button>
        <span className="nav-brand" style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            whiteSpace: 'nowrap', fontSize: '18px', fontWeight: '900', color: '#ffffff', pointerEvents: 'none'
        }}>
            帳款類型管理
        </span>
        <button 
          onClick={() => openSheet()} 
          className="navbar-add-btn" 
          style={{ 
            zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', 
            padding: '0 18px', width: 'auto', minWidth: '110px', height: '42px', 
            borderRadius: '50px', backgroundColor: 'var(--color-primary)', border: 'none',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
          }}
        >
          <Plus size={18} color="#ffffff" strokeWidth={3} />
          <span style={{ fontSize: '15px', fontWeight: '800', color: '#fff' }}>新增</span>
        </button>
      </header>

      {/* 2. 內容容器 */}
      <div className="content-area-wrapper" style={{ flex: 1, overflowY: 'auto' }}>
        <main className="band-container" style={{ paddingTop: '24px' }}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {items.length > 0 ? (
                  items.map(item => (
                    <SortableTypeItem key={item.id} item={item} onEdit={openSheet} onDelete={setDeleteTarget} />
                  ))
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--color-text-sub)', marginTop: '48px' }}>
                    目前尚無類型標籤
                  </div>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </main>
      </div>

      {/* 3. 抽屜彈窗 */}
      <div className={`drawer-overlay ${isSheetOpen ? 'active' : ''}`} onClick={() => !loading && setIsSheetOpen(false)}>
        <div className="drawer-container" style={{ padding: '32px 24px' }} onClick={(e) => e.stopPropagation()}>
          <div style={{ width: '40px', height: '5px', background: '#333', borderRadius: '10px', margin: '0 auto 24px' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#fff' }}>類型設定</h3>
            <button onClick={() => setIsSheetOpen(false)} style={{ background: 'none', border: 'none', color: '#666' }}><X size={24}/></button>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--color-text-sub)', fontSize: '13px', fontWeight: '800', marginBottom: '8px', paddingLeft: '4px' }}>類型名稱</label>
              <div className="band-input-pill" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Tag size={18} color="#666" />
                <input 
                  type="text" placeholder="例如：吃飯、住宿、交通 等" value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={{ background: 'transparent', border: 'none', color: '#fff', width: '100%', outline: 'none' }} required 
                />
              </div>
            </div>

            <div>
  <label style={{ 
    display: 'block', 
    color: 'var(--color-text-sub)', 
    fontSize: '13px', 
    fontWeight: '800', 
    marginBottom: '12px', // 稍微增加間距讓視覺更開闊
    paddingLeft: '4px' 
  }}>
    標籤色彩
  </label>
  
  <ConfigProvider theme={{ 
    token: { 
      zIndexPopupBase: 10005,
      colorText: '#ffffff' // 確保彈出視窗文字也是白色
    } 
  }}>
    {/* ★ 核心修正：移除外部 band-input-pill 類名與背景框 */}
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
      <ColorPicker 
        showText 
        value={formData.primary_color}
        onChange={(color) => setFormData({...formData, primary_color: color})}
        getPopupContainer={(trigger) => trigger.parentElement} 
        style={{ 
          width: '100%',           // 撐滿整個畫面寬度
          height: '52px',          // 紮實的高度感
          background: '#1a1a1a',   // 深空地基色
          border: '1px solid #333', 
          borderRadius: '50px',    // 鋼鐵膠囊造型
          padding: '0 24px',
          color: '#ffffff',        // ★ 關鍵：黑色文字轉白色
          display: 'flex',
          alignItems: 'center',    // ★ 內部預覽色塊與 Hex 上下置中
          justifyContent: 'center', // 內容整體左右置中
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
        }} 
      />
    </div>
  </ConfigProvider>
</div>

            <button type="submit" className="band-btn-main" style={{ marginTop: '12px' }} disabled={loading}>
              {loading ? '正在儲存...' : '確認儲存類型'}
            </button>
          </form>
        </div>
      </div>

      {/* 4. 二次確認彈窗 */}
      <ConfirmModal 
        open={!!deleteTarget} title="移除帳款類型？" 
        content={`移除後，原本關聯「${deleteTarget?.name}」的專案將失去標籤，且此操作無法復原。確定要移除嗎？`} 
        onCancel={() => setDeleteTarget(null)} 
        onConfirm={executeDelete} 
      />
    </div>
  );
};

export default EventTypeMgmtView;