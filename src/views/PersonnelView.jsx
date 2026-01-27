import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, User, GripVertical } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Modal, Form, Input, message } from 'antd';
import ConfirmModal from '../components/ConfirmModal';

const PersonnelView = ({ user, onBack }) => {
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form] = Form.useForm();

  const fetchPersonnel = async () => {
    const { data } = await supabase.from('personnel').select('*').order('sort_order');
    setItems(data || []);
  };

  useEffect(() => { fetchPersonnel(); }, []);

  const handleSave = async (v) => {
    const payload = { ...v, user_id: user.id };
    if (editingItem) await supabase.from('personnel').update(payload).eq('id', editingItem.id);
    else await supabase.from('personnel').insert(payload);
    setIsModalOpen(false);
    fetchPersonnel();
  };

  return (
    <div className="app-main-layout">
      {/* 統一 64px 導航欄 */}
      <header className="navbar" style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid #222' }}>
        <button onClick={onBack} className="hamburger-btn"><ArrowLeft size={24}/></button>
        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>人員名單管理</span>
        <button className="hamburger-btn" onClick={() => { setEditingItem(null); form.resetFields(); setIsModalOpen(true); }}>
          <Plus size={24} color="var(--color-primary)" />
        </button>
      </header>

      {/* 24px 內距內容區 */}
      <main style={{ padding: '24px', flex: 1 }}>
        {items.map(item => (
          <div key={item.id} className="person-pill-card" style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--color-card)', padding: '12px 16px', borderRadius: '50px', marginBottom: '12px' }}>
             <GripVertical size={20} color="var(--color-text-muted)" style={{ marginRight: '10px' }} />
             <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                <User size={20} color="white" />
             </div>
             <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-sub)' }}>{item.role || '成員'}</div>
             </div>
             <button onClick={() => setDeleteTarget(item)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)' }}>
                <Trash2 size={18} />
             </button>
          </div>
        ))}
      </main>

      <Modal open={isModalOpen} title={editingItem ? "編輯人員" : "新增人員"} onCancel={() => setIsModalOpen(false)} onOk={() => form.submit()} centered>
        <Form form={form} onFinish={handleSave} layout="vertical">
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}><Input className="band-input" /></Form.Item>
          <Form.Item name="role" label="職稱"><Input className="band-input" placeholder="例：吉他手" /></Form.Item>
        </Form>
      </Modal>

      <ConfirmModal open={!!deleteTarget} title="移除人員？" content={`確定要將「${deleteTarget?.name}」移除嗎？`} onCancel={() => setDeleteTarget(null)} onConfirm={async () => { await supabase.from('personnel').delete().eq('id', deleteTarget.id); setDeleteTarget(null); fetchPersonnel(); }} />
    </div>
  );
};

export default PersonnelView;