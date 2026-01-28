import React, { useState, useEffect, useRef } from 'react';
import { X, DollarSign, FileText, User, Users, Check, ChevronDown, Tag as TagIcon, Trash2 } from 'lucide-react'; // ★ 改用 FileText
import { supabase } from '../lib/supabaseClient';
import { message } from 'antd';
import dayjs from 'dayjs';
import ResponsiveDatePicker from './ResponsiveDatePicker'; 
import ConfirmModal from './ConfirmModal';

const AddTransactionModal = ({ isOpen, onClose, project, personnel = [], user, onRefresh, transaction = null }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // 表單狀態
  const [formData, setFormData] = useState({
    title: '', amount: '', type: 'advance', category_id: null,
    date: dayjs().format('YYYY-MM-DD'), payer_id: null,
    debtor_id: null, participants: [], description: ''
  });

  // 初始化資料
  useEffect(() => {
    if (isOpen) {
      supabase.from('categories').select('*').order('name').then(({ data }) => {
        if (data?.length > 0) {
          setCategories(data);
          if (!transaction) {
             setFormData(prev => prev.category_id ? prev : ({ ...prev, category_id: data[0].id }));
          }
        }
      });

      if (transaction) {
        setFormData({
          title: transaction.title,
          amount: transaction.amount,
          type: transaction.type,
          category_id: transaction.category_id,
          date: transaction.date,
          payer_id: transaction.payer_id,
          debtor_id: transaction.debtor_id,
          participants: transaction.transaction_participants 
            ? transaction.transaction_participants.map(tp => tp.personnel_id) 
            : [], 
          description: transaction.description || ''
        });
      } else if (project) {
        const memberIds = project.project_members?.map(pm => pm.personnel?.id).filter(Boolean) || [];
        const myId = personnel?.find(p => p.name === '安志')?.id || memberIds[0];
        
        setFormData({
          title: '', amount: '', type: 'advance', category_id: null,
          date: dayjs().format('YYYY-MM-DD'), payer_id: myId,
          debtor_id: null, participants: memberIds, description: ''
        });
      }
    }
  }, [isOpen, project, personnel, transaction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || !formData.amount || !formData.payer_id) return;
    setLoading(true);

    const payload = {
      project_id: project.id, 
      user_id: user.id, 
      title: formData.title.trim() || '未命名項目',
      amount: parseFloat(formData.amount), 
      type: formData.type, 
      category_id: formData.category_id,
      date: formData.date, 
      payer_id: formData.payer_id,
      debtor_id: formData.type === 'debt' ? formData.debtor_id : null,
    };

    try {
      let txId = null;

      if (transaction) {
        const { error } = await supabase.from('transactions').update(payload).eq('id', transaction.id);
        if (error) throw error;
        txId = transaction.id;
        await supabase.from('transaction_participants').delete().eq('transaction_id', txId);
      } else {
        const { data, error } = await supabase.from('transactions').insert([payload]).select().single();
        if (error) throw error;
        txId = data.id;
      }

      if (formData.type === 'advance' && formData.participants.length > 0) {
        const participantsPayload = formData.participants.map(pid => ({ 
          transaction_id: txId, personnel_id: pid, user_id: user.id 
        }));
        const { error: pError } = await supabase.from('transaction_participants').insert(participantsPayload);
        if (pError) throw pError;
      }

      message.success(transaction ? '修改成功' : '記帳成功'); 
      onClose(); 
      onRefresh();
    } catch (err) { 
      console.error(err);
      message.error(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  const executeDelete = async () => {
    setLoading(true);
    try {
      await supabase.from('transactions').delete().eq('id', transaction.id);
      message.success('已刪除');
      setIsDeleteConfirmOpen(false);
      onClose();
      onRefresh();
    } catch (err) {
      message.error('刪除失敗');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getCategoryName = (id) => categories.find(c => c.id === id)?.name || '請選擇類型';
  const getPersonnelName = (id) => personnel?.find(p => p.id === id)?.name || '未選擇';

  return (
    <>
      <div className={`drawer-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
        <div className="drawer-container" onClick={(e) => e.stopPropagation()} style={{ padding: '24px' }}>
          <div style={{ width: '40px', height: '5px', background: '#333', borderRadius: '10px', margin: '0 auto 20px' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#fff' }}>
              {transaction ? '編輯帳務' : '新增行程帳務'}
            </h3>
            <div style={{ display: 'flex', gap: '16px' }}>
              {transaction && (
                <button 
                  onClick={() => setIsDeleteConfirmOpen(true)} 
                  style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}
                >
                  <Trash2 size={24}/>
                </button>
              )}
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
                <X size={24}/>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '8px', margin: '10px 0 20px' }}>
              <span style={{ fontSize: '20px', color: '#555', fontWeight: 900 }}>NT$</span>
              <input 
                type="number" placeholder="0" value={formData.amount} 
                onChange={e => setFormData({...formData, amount: e.target.value})} 
                style={{ background: 'transparent', border: 'none', fontSize: '48px', fontWeight: '900', color: 'var(--color-primary)', width: '180px', outline: 'none', textAlign: 'center' }} required 
              />
            </div>

            {/* ★ 優化後的標題與日期列 */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {/* 1. 標題：佔據剩餘空間 (flex: 1) */}
              <div className="band-input-pill" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* 換掉醜醜的 Type icon，改用 FileText */}
                <FileText size={18} color="#666" />
                <input 
                  type="text" placeholder="標題" value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '15px', fontWeight: '500' }} required 
                />
              </div>

              {/* 2. 日期：固定寬度 150px，確保能完整顯示而不擁擠 */}
              <div style={{ width: '150px' }}>
                <ResponsiveDatePicker 
                  value={dayjs(formData.date)} 
                  onChange={(val) => setFormData({...formData, date: val.format('YYYY-MM-DD')})}
                  style={{ 
                    // 讓 DatePicker 的外觀跟 band-input-pill 完全一致
                    backgroundColor: '#222', 
                    border: '1px solid var(--color-border)',
                    borderRadius: '50px', // 跟 Pill 一樣的圓角
                    height: '50px',
                    color: '#fff'
                  }}
                />
              </div>
            </div>

            <div style={{ 
              position: 'relative', width: '100%', background: '#111', borderRadius: '14px', 
              padding: '4px', display: 'flex', height: '54px', overflow: 'hidden'
            }}>
              <div style={{ 
                position: 'absolute', top: '4px', left: '4px', width: 'calc(50% - 4px)', height: 'calc(100% - 8px)', 
                background: '#2a2a2a', borderRadius: '10px', transition: '0.3s',
                transform: formData.type === 'debt' ? 'translateX(100%)' : 'translateX(0)'
              }} />
              <button type="button" onClick={() => setFormData({...formData, type: 'advance'})} style={{ flex: 1, zIndex: 2, background: 'none', border: 'none', color: formData.type === 'advance' ? 'var(--color-primary)' : '#888', fontWeight: 800, cursor: 'pointer' }}>墊付</button>
              <button type="button" onClick={() => setFormData({...formData, type: 'debt'})} style={{ flex: 1, zIndex: 2, background: 'none', border: 'none', color: formData.type === 'debt' ? 'var(--color-primary)' : '#888', fontWeight: 800, cursor: 'pointer' }}>欠款</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <SelectionLayer label="類型" value={getCategoryName(formData.category_id)} icon={<TagIcon size={14}/>} isOpen={activeMenu === 'cat'} onClick={() => setActiveMenu(activeMenu === 'cat' ? null : 'cat')}>
                {categories.map(c => (
                  <div key={c.id} className={`selection-item ${formData.category_id === c.id ? 'active' : ''}`} onClick={() => { setFormData({...formData, category_id: c.id}); setActiveMenu(null); }}>
                    {c.name} {formData.category_id === c.id && <Check size={16} />}
                  </div>
                ))}
              </SelectionLayer>

              <SelectionLayer label="付款人" value={getPersonnelName(formData.payer_id)} icon={<User size={14}/>} isOpen={activeMenu === 'payer'} onClick={() => setActiveMenu(activeMenu === 'payer' ? null : 'payer')}>
                {personnel?.map(p => (
                  <div key={p.id} className={`selection-item ${formData.payer_id === p.id ? 'active' : ''}`} onClick={() => { setFormData({...formData, payer_id: p.id}); setActiveMenu(null); }}>
                    {p.name} {formData.payer_id === p.id && <Check size={16} />}
                  </div>
                ))}
              </SelectionLayer>

              <SelectionLayer label={formData.type === 'advance' ? "參與分擔" : "欠款人"} value={formData.type === 'advance' ? `${formData.participants.length} 人參與` : getPersonnelName(formData.debtor_id)} icon={<Users size={14}/>} isOpen={activeMenu === 'part'} onClick={() => setActiveMenu(activeMenu === 'part' ? null : 'part')}>
                {personnel?.map(p => {
                  const isChecked = formData.type === 'advance' ? formData.participants.includes(p.id) : formData.debtor_id === p.id;
                  return (
                    <div key={p.id} className={`selection-item ${isChecked ? 'active' : ''}`} onClick={() => {
                      if (formData.type === 'debt') {
                        setFormData({...formData, debtor_id: p.id}); setActiveMenu(null);
                      } else {
                        const next = isChecked ? formData.participants.filter(id => id !== p.id) : [...formData.participants, p.id];
                        setFormData({...formData, participants: next});
                      }
                    }}>
                      {p.name} {isChecked && <Check size={16} />}
                    </div>
                  );
                })}
              </SelectionLayer>
            </div>

            <button type="submit" className="band-btn-main" style={{ width: '100%' }} disabled={loading}>
              {loading ? '正在儲存...' : (transaction ? '確認修改' : '確認新增帳務')}
            </button>
          </form>
        </div>
      </div>

      <ConfirmModal
        open={isDeleteConfirmOpen}
        title="刪除帳務？"
        content="確定要刪除這筆帳務紀錄嗎？此動作無法復原。"
        onConfirm={executeDelete}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />
    </>
  );
};

// SelectionLayer 保持不變
const SelectionLayer = ({ label, value, icon, isOpen, onClick, children }) => {
  const [placement, setPlacement] = useState('down');
  const triggerRef = useRef(null);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setPlacement(spaceBelow < 250 ? 'up' : 'down');
    }
  }, [isOpen]);

  return (
    <div className="overlay-anchor" ref={triggerRef}>
      <div 
        className="band-input-pill" 
        onClick={onClick} 
        style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          cursor: 'pointer', borderColor: isOpen ? 'var(--color-primary)' : 'var(--color-border)' 
        }}
      >
        <div style={{ color: '#888', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>{icon} {label}</div>
        <div style={{ color: 'var(--color-primary)', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '15px' }}>
          {value} <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
        </div>
      </div>
      {isOpen && (
        <div className={`absolute-floating-menu ${placement === 'up' ? 'is-upwards' : ''}`}>
          {children}
        </div>
      )}
    </div>
  );
};

export default AddTransactionModal;