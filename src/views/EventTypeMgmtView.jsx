import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, GripVertical } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Modal, Form, Input, message, Tag, ColorPicker } from 'antd';
import ConfirmModal from '../components/ConfirmModal';

const hexToRgba = (hex, alpha) => {
  if (!hex) return `rgba(58, 143, 183, ${alpha})`;
  let c = hex.substring(1).split('');
  if (c.length === 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]];
  c = '0x' + c.join('');
  return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ')';
};

const SortableItem = ({ item, onClick, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const color = item.primary_color || '#3a8fb7';

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="settings-item-card">
      <div {...listeners} style={{ cursor: 'grab', padding: '10px' }}><GripVertical size={20} color="var(--color-text-muted)" /></div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => onClick(item)}>
        <Tag bordered={false} style={{ backgroundColor: hexToRgba(color, 0.15), color: color, padding: '4px 16px', borderRadius: '50px', fontWeight: 'bold' }}>{item.name}</Tag>
        <button className="delete-btn" onClick={(e) => { e.stopPropagation(); onRemove(item); }}><Trash2 size={18} /></button>
      </div>
    </div>
  );
};

const EventTypeMgmtView = ({ user, onBack, onRefresh, eventTypes }) => {
  const [items, setItems] = useState(eventTypes || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => { setItems(eventTypes || []); }, [eventTypes]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleSave = async (v) => {
    try {
      const color = typeof v.primary_color === 'string' ? v.primary_color : v.primary_color.toHexString();
      const payload = { name: v.name, primary_color: color, user_id: user.id };
      if (editingItem) await supabase.from('categories').update(payload).eq('id', editingItem.id);
      else await supabase.from('categories').insert(payload);
      setIsModalOpen(false);
      onRefresh();
    } catch (err) { message.error('儲存失敗'); }
  };

  return (
    <div className="app-main-layout">
      <header className="navbar" style={{ height: '64px', padding: '0 20px', borderBottom: '1px solid #222' }}>
        <button onClick={onBack} className="hamburger-btn"><ArrowLeft size={24}/></button>
        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>活動類型管理</span>
        <button className="hamburger-btn" onClick={() => { setEditingItem(null); form.resetFields(); setIsModalOpen(true); }}><Plus size={24} color="var(--color-primary)" /></button>
      </header>

      <main style={{ padding: '24px', flex: 1 }}>
        <DndContext sensors={sensors} collisionDetection={closestCenter}>
          <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
            {items.map(item => (
              <SortableItem key={item.id} item={item} onClick={showModal} onRemove={setDeleteTarget} />
            ))}
          </SortableContext>
        </DndContext>
      </main>

      <Modal open={isModalOpen} title="類型設定" onCancel={() => setIsModalOpen(false)} onOk={() => form.submit()} centered>
        <Form form={form} onFinish={handleSave} layout="vertical">
          <Form.Item name="name" label="名稱" rules={[{ required: true }]}><Input className="band-input" /></Form.Item>
          <Form.Item name="primary_color" label="顏色"><ColorPicker showText style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>

      <ConfirmModal open={!!deleteTarget} title="刪除類型？" content={`確定要刪除「${deleteTarget?.name}」嗎？`} onCancel={() => setDeleteTarget(null)} onConfirm={async () => { await supabase.from('categories').delete().eq('id', deleteTarget.id); setDeleteTarget(null); onRefresh(); }} />
    </div>
  );
};

export default EventTypeMgmtView;