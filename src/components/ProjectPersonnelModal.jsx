import React, { useState, useEffect } from 'react';
import { X, Users, Trash2, Edit2, Check, User, Link as LinkIcon, Plus, GripVertical, Share2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { message, Modal } from 'antd';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import ConfirmModal from './ConfirmModal';

// --- 拖拽排序子組件 ---
const SortableItem = ({ id, children, isReadOnly }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: isReadOnly });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 'auto',
    position: 'relative',
    touchAction: 'none',
    cursor: isReadOnly ? 'default' : (isDragging ? 'grabbing' : 'grab') // ★ 增加手勢提示
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} // ★ 將 listeners 移到這裡，讓整個範圍都能觸發拖拽
    >
      <div className="band-card" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '12px 16px', 
        background: isDragging ? '#2a2a2a' : undefined, 
        boxShadow: isDragging ? '0 10px 20px rgba(0,0,0,0.5)' : undefined,
        opacity: isReadOnly ? 0.9 : 1,
        userSelect: 'none' // ★ 避免拖拽時選取到文字
      }}>
        {/* 拖拽手把圖示現在變為純裝飾 */}
        {!isReadOnly && (
          <div style={{ marginRight: '12px', color: '#666', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
            <GripVertical size={20} />
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

// --- 主組件 ---
const ProjectPersonnelModal = ({ isOpen, onClose, project, onRefresh, user }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  const isReadOnly = project?.status === 'settling' || project?.status === 'archived';

  const sensors = useSensors(
    useSensor(PointerSensor, { 
      activationConstraint: { distance: 8 } // ★ 稍微增加觸發距離，避免點擊與拖拽太敏感
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchMembers = async () => {
    if (!project) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('personnel')
        .select('*')
        .eq('project_id', project.id)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      message.error('讀取失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
      setNewName('');
      setEditingId(null);
    }
  }, [isOpen, project]);

  const handleDragEnd = async (event) => {
    if (isReadOnly) return;
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setMembers((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        updateSortOrder(newItems);
        return newItems;
      });
    }
  };

  const updateSortOrder = async (sortedItems) => {
    const updates = sortedItems.map((item, index) => ({
      id: item.id,
      project_id: project.id,
      name: item.name,
      sort_order: index
    }));
    try {
      await supabase.from('personnel').upsert(updates);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('排序更新失敗', err);
    }
  };

  const handleAdd = async () => {
    if (isReadOnly || !newName.trim()) return;
    try {
      const maxSortOrder = members.length > 0 ? Math.max(...members.map(m => m.sort_order || 0)) : 0;
      const { error } = await supabase.from('personnel').insert([{
        project_id: project.id,
        name: newName.trim(),
        sort_order: maxSortOrder + 1
      }]);
      if (error) throw error;
      message.success('已新增成員');
      setNewName('');
      fetchMembers();
      if (onRefresh) onRefresh();
    } catch (err) {
      message.error('新增失敗');
    }
  };

  const handleUpdate = async (id) => {
    if (isReadOnly || !editingName.trim()) return;
    try {
      const { error } = await supabase.from('personnel')
        .update({ name: editingName.trim() })
        .eq('id', id);
      if (error) throw error;
      message.success('更名成功');
      setEditingId(null);
      fetchMembers();
      if (onRefresh) onRefresh();
    } catch (err) {
      message.error('更新失敗');
    }
  };

  const handleCopyInvite = () => {
    if (!project?.invite_code) {
      message.error('無邀請碼');
      return;
    }
    const inviteLink = `${window.location.origin}${window.location.pathname}?code=${project.invite_code}`;
    navigator.clipboard.writeText(inviteLink)
      .then(() => message.success('已複製邀請連結'))
      .catch(() => message.error('複製失敗'));
  };

  const handleDeleteClick = async (member) => {
    if (isReadOnly) return;
    if (member.linked_user_id === project.user_id) {
      message.warning('無法刪除專案擁有者 (Owner)。');
      return;
    }
    if (member.linked_user_id === user?.id) {
        message.warning('你不能將自己剔除。');
        return;
    }
    const isOwner = user?.id === project.user_id;
    if (!isOwner && member.linked_user_id) {
        message.warning('只有專案擁有者可以剔除成員。');
        return;
    }

    const { count: txCount } = await supabase.from('transactions').select('*', { count: 'exact', head: true }).or(`payer_id.eq.${member.id},debtor_id.eq.${member.id}`);
    const { count: partCount } = await supabase.from('transaction_participants').select('*', { count: 'exact', head: true }).eq('personnel_id', member.id);

    if ((txCount || 0) > 0 || (partCount || 0) > 0) {
      Modal.error({ title: '無法刪除', content: `「${member.name}」已有記帳或分帳紀錄，無法移除。`, okText: '知道了' });
      return;
    }
    setMemberToDelete(member);
    setIsDeleteConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!memberToDelete) return;
    try {
      if (memberToDelete.linked_user_id) {
         await supabase.from('project_members').delete().eq('project_id', project.id).eq('user_id', memberToDelete.linked_user_id);
      }
      const { error } = await supabase.from('personnel').delete().eq('id', memberToDelete.id);
      if (error) throw error;
      message.success(memberToDelete.linked_user_id ? '已將成員踢出專案' : '已刪除成員');
      fetchMembers();
      if (onRefresh) onRefresh();
    } catch (err) {
      message.error('刪除失敗');
    } finally {
      setIsDeleteConfirmOpen(false);
      setMemberToDelete(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={`drawer-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} style={{zIndex: 1500}}>
        <div className="drawer-container" onClick={(e) => e.stopPropagation()} style={{ padding: '24px', height: '85vh', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexShrink: 0 }}>
            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={24} color="var(--color-primary)" />
              專案成員管理
            </h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
              <X size={24}/>
            </button>
          </div>

          {isReadOnly && (
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 16px', borderRadius: '10px', marginBottom: '16px', color: '#888', fontSize: '13px', textAlign: 'center' }}>
              專案結算中或已歸檔，成員資料僅供查看
            </div>
          )}

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '20px' }}>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={members.map(m => m.id)} strategy={verticalListSortingStrategy}>
                {members.map(p => (
                  <SortableItem key={p.id} id={p.id} isReadOnly={isReadOnly}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <div style={{ position: 'relative' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={20} color="#888" />
                        </div>
                        {p.linked_user_id && (
                          <div style={{ position: 'absolute', bottom: -4, right: -4, background: 'var(--color-primary)', borderRadius: '50%', padding: '2px', border: '2px solid #1e1e1e' }}>
                            <LinkIcon size={10} color="#fff" />
                          </div>
                        )}
                      </div>

                      {editingId === p.id ? (
                        <input 
                          autoFocus value={editingName} 
                          onChange={(e) => setEditingName(e.target.value)}
                          onPointerDown={(e) => e.stopPropagation()} // ★ 防止輸入框觸發拖拽
                          style={{ background: '#000', border: '1px solid var(--color-primary)', color: '#fff', padding: '6px 10px', borderRadius: '8px', width: '100%', outline: 'none' }}
                        />
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ color: '#fff', fontWeight: '700', fontSize: '16px' }}>{p.name}</span>
                          <span style={{ color: '#666', fontSize: '12px' }}>
                            {p.linked_user_id 
                              ? (p.linked_user_id === project.user_id ? '專案擁有者' : (p.linked_user_id === user?.id ? '已綁定 (你)' : '已綁定成員'))
                              : '未認領成員'}
                          </span>
                        </div>
                      )}
                    </div>

                    {!isReadOnly && (
                      <div 
                        style={{ display: 'flex', gap: '8px', marginLeft: '12px' }} 
                        onPointerDown={(e) => e.stopPropagation()} // ★ 關鍵：點擊按鈕時阻止事件冒泡，不觸發拖拽
                      >
                        {editingId === p.id ? (
                          <div style={{display: 'flex', gap: '8px'}}>
                            <button onClick={() => handleUpdate(p.id)} style={{ padding: '8px', borderRadius: '8px', background: 'var(--color-primary)', border: 'none', color: '#fff', cursor: 'pointer' }}><Check size={18} /></button>
                            <button onClick={() => setEditingId(null)} style={{ padding: '8px', borderRadius: '8px', background: '#333', border: 'none', color: '#ccc', cursor: 'pointer' }}><X size={18} /></button>
                          </div>
                        ) : (
                          <div style={{display: 'flex', gap: '8px'}}>
                            <button onClick={() => { setEditingId(p.id); setEditingName(p.name); }} style={{ padding: '8px', borderRadius: '8px', background: '#333', border: 'none', color: '#ccc', cursor: 'pointer' }}><Edit2 size={18} /></button>
                            <button onClick={() => handleDeleteClick(p)} style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255, 107, 107, 0.1)', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}><Trash2 size={18} /></button>
                          </div>
                        )}
                      </div>
                    )}
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
          </div>

          <div style={{ paddingTop: '16px', borderTop: '1px solid #333', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              onClick={handleCopyInvite}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px dashed #444', color: 'var(--color-primary)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Share2 size={18} /> 複製專案邀請連結
            </button>

            {!isReadOnly && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <input 
                  type="text" placeholder="輸入新成員名稱" value={newName} onChange={(e) => setNewName(e.target.value)}
                  style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', background: '#222', border: '1px solid #444', color: '#fff', outline: 'none' }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
                <button 
                  onClick={handleAdd} disabled={!newName.trim()}
                  style={{ padding: '0 20px', borderRadius: '12px', background: newName.trim() ? 'var(--color-primary)' : '#444', border: 'none', color: '#fff', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={20} /> 新增
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={isDeleteConfirmOpen}
        title={`刪除/踢出 ${memberToDelete?.name}？`}
        content={memberToDelete?.linked_user_id ? "此成員已綁定帳號。刪除後，他將失去專案存取權限且無法復原。" : "確定要刪除這位成員嗎？此動作無法復原。"}
        onConfirm={executeDelete}
        onCancel={() => { setIsDeleteConfirmOpen(false); setMemberToDelete(null); }}
      />
    </>
  );
};

export default ProjectPersonnelModal;