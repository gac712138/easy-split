import React, { useState, useEffect, useRef } from 'react';
import { X, FileText, User, Users, Check, ChevronDown, Tag as TagIcon, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { message } from 'antd';
import dayjs from 'dayjs';
import ResponsiveDatePicker from './ResponsiveDatePicker'; 
import ConfirmModal from './ConfirmModal';

const AddTransactionModal = ({ 
  isOpen, 
  onClose, 
  project, 
  personnel = [], 
  categories = [], // ★ 修正：接收外部同步好的類別
  user, 
  onRefresh, 
  transaction = null 
}) => {
  const [loading, setLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // 表單狀態
  const [formData, setFormData] = useState({
    title: '', amount: '', type: 'advance', category_id: null,
    date: dayjs().format('YYYY-MM-DD'), payer_id: null,
    debtor_id: null, participants: [], description: ''
  });

  const projectPersonnel = personnel.filter(p => p.project_id === project?.id);

  // 初始化資料與預設值邏輯
  useEffect(() => {
    if (isOpen && project?.id && user?.id) {
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
      } else {
        const myPersonnel = projectPersonnel.find(p => p.linked_user_id === user.id);
        const defaultPayerId = myPersonnel ? myPersonnel.id : (projectPersonnel[0]?.id || null);
        const allMemberIds = projectPersonnel.map(p => p.id); 

        // ★ 優化：欠款時預設選取「非自己」的第一位成員
        const otherMembers = projectPersonnel.filter(p => p.linked_user_id !== user.id);
        const defaultDebtorId = otherMembers.length > 0 ? otherMembers[0].id : null;

        setFormData({
          title: '', amount: '', type: 'advance', 
          category_id: categories[0]?.id || null, // 直接拿傳入的類別
          date: dayjs().format('YYYY-MM-DD'), 
          payer_id: defaultPayerId,
          debtor_id: defaultDebtorId, // 套用預設欠款者
          participants: allMemberIds, 
          description: ''
        });
      }
    }
  }, [isOpen, project?.id, user?.id, personnel, transaction, categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || !formData.amount || !formData.payer_id) return;

    // ★ 修正：墊付模式下的參與者必填驗證
    if (formData.type === 'advance' && formData.participants.length === 0) {
      message.error('墊付模式下，參與者名單不能為空');
      return;
    }

    // 欠款模式下的借款人驗證
    if (formData.type === 'debt' && !formData.debtor_id) {
      message.error('欠款模式下，請選擇一位欠款人');
      return;
    }

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
      description: formData.description
    };

    try {
      let txId = null;
      if (transaction) {
        await supabase.from('transactions').update(payload).eq('id', transaction.id);
        txId = transaction.id;
        await supabase.from('transaction_participants').delete().eq('transaction_id', txId);
      } else {
        const { data, error } = await supabase.from('transactions').insert([payload]).select().single();
        if (error) throw error;
        txId = data.id;
      }

      if (formData.type === 'advance' && formData.participants.length > 0) {
        const participantsPayload = formData.participants.map(pid => ({ 
          transaction_id: txId, 
          personnel_id: pid, 
          user_id: user.id 
        }));
        await supabase.from('transaction_participants').insert(participantsPayload);
      }

      message.success(transaction ? '修改成功' : '記帳成功'); 
      onClose(); 
      onRefresh();
    } catch (err) { 
      message.error(err.message); 
    } finally { setLoading(false); }
  };

  const executeDelete = async () => {
    setLoading(true);
    try {
      await supabase.from('transactions').delete().eq('id', transaction.id);
      message.success('已刪除');
      setIsDeleteConfirmOpen(false);
      onClose();
      onRefresh();
    } catch (err) { message.error('刪除失敗'); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;

  const getCategoryName = (id) => categories.find(c => c.id === id)?.name || '請選擇類型';
  const getPersonnelName = (id) => {
    const p = projectPersonnel?.find(p => p.id === id);
    if (!p) return '未選擇';
    return p.linked_user_id === user?.id ? `${p.name} (你)` : p.name;
  };

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
                <button onClick={() => setIsDeleteConfirmOpen(true)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}><Trash2 size={24}/></button>
              )}
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}><X size={24}/></button>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 金額、標題、日期輸入區維持原本樣式 */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '8px', margin: '10px 0 20px' }}>
              <span style={{ fontSize: '20px', color: '#555', fontWeight: 900 }}>NT$</span>
              <input type="number" placeholder="0" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} style={{ background: 'transparent', border: 'none', fontSize: '48px', fontWeight: '900', color: 'var(--color-primary)', width: '180px', outline: 'none', textAlign: 'center' }} required />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div className="band-input-pill" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FileText size={18} color="#666" />
                <input type="text" placeholder="標題" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '15px', fontWeight: '500' }} required />
              </div>
              <div style={{ width: '150px' }}>
                <ResponsiveDatePicker value={dayjs(formData.date)} onChange={(val) => setFormData({...formData, date: val.format('YYYY-MM-DD')})} />
              </div>
            </div>

            <div style={{ position: 'relative', width: '100%', background: '#111', borderRadius: '14px', padding: '4px', display: 'flex', height: '54px', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '4px', left: '4px', width: 'calc(50% - 4px)', height: 'calc(100% - 8px)', background: '#2a2a2a', borderRadius: '10px', transition: '0.3s', transform: formData.type === 'debt' ? 'translateX(100%)' : 'translateX(0)' }} />
              <button type="button" onClick={() => setFormData({...formData, type: 'advance'})} style={{ flex: 1, zIndex: 2, background: 'none', border: 'none', color: formData.type === 'advance' ? 'var(--color-primary)' : '#888', fontWeight: 800, cursor: 'pointer' }}>墊付</button>
              <button type="button" onClick={() => setFormData({...formData, type: 'debt'})} style={{ flex: 1, zIndex: 2, background: 'none', border: 'none', color: formData.type === 'debt' ? 'var(--color-primary)' : '#888', fontWeight: 800, cursor: 'pointer' }}>欠款</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* 下拉選單改用 Props 傳入的 categories */}
              <SelectionLayer label="活動類型" value={getCategoryName(formData.category_id)} icon={<TagIcon size={14}/>} isOpen={activeMenu === 'cat'} onClick={() => setActiveMenu(activeMenu === 'cat' ? null : 'cat')}>
                {categories.map(c => (
                  <div key={c.id} className={`selection-item ${formData.category_id === c.id ? 'active' : ''}`} onClick={() => { setFormData({...formData, category_id: c.id}); setActiveMenu(null); }}>
                    {c.name} {formData.category_id === c.id && <Check size={16} />}
                  </div>
                ))}
              </SelectionLayer>

              <SelectionLayer label={formData.type === 'debt' ? "借款人" : "付款人"} value={getPersonnelName(formData.payer_id)} icon={<User size={14}/>} isOpen={activeMenu === 'payer'} onClick={() => setActiveMenu(activeMenu === 'payer' ? null : 'payer')}>
                {projectPersonnel?.map(p => (
                  <div key={p.id} className={`selection-item ${formData.payer_id === p.id ? 'active' : ''}`} onClick={() => { setFormData({...formData, payer_id: p.id}); setActiveMenu(null); }}>
                    {p.name} {p.linked_user_id === user?.id && '(你)'} {formData.payer_id === p.id && <Check size={16} />}
                  </div>
                ))}
              </SelectionLayer>

              <SelectionLayer label={formData.type === 'advance' ? "參與者" : "欠款人"} value={formData.type === 'advance' ? `${formData.participants.length} 人參與` : getPersonnelName(formData.debtor_id)} icon={<Users size={14}/>} isOpen={activeMenu === 'part'} onClick={() => setActiveMenu(activeMenu === 'part' ? null : 'part')}>
                {projectPersonnel?.map(p => {
                  const isChecked = formData.type === 'advance' ? formData.participants.includes(p.id) : formData.debtor_id === p.id;
                  return (
                    <div key={p.id} className={`selection-item ${isChecked ? 'active' : ''}`} onClick={() => {
                      if (formData.type === 'debt') { setFormData({...formData, debtor_id: p.id}); setActiveMenu(null); } 
                      else { const next = isChecked ? formData.participants.filter(id => id !== p.id) : [...formData.participants, p.id]; setFormData({...formData, participants: next}); }
                    }}>
                      {p.name} {p.linked_user_id === user?.id && '(你)'} {isChecked && <Check size={16} />}
                    </div>
                  );
                })}
              </SelectionLayer>
            </div>

            <button type="submit" className="band-btn-main" style={{ width: '100%', borderRadius: '50px', fontWeight: '800' }} disabled={loading}>
              {loading ? '正在儲存...' : (transaction ? '確認修改' : '確認新增帳務')}
            </button>
          </form>
        </div>
      </div>
      <ConfirmModal open={isDeleteConfirmOpen} title="刪除帳務？" content="確定要刪除這筆帳務紀錄嗎？此動作無法復原。" onConfirm={executeDelete} onCancel={() => setIsDeleteConfirmOpen(false)} />
    </>
  );
};

const SelectionLayer = ({ label, value, icon, isOpen, onClick, children }) => {
  const [placement, setPlacement] = useState('down');
  const triggerRef = useRef(null);
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPlacement(window.innerHeight - rect.bottom < 250 ? 'up' : 'down');
    }
  }, [isOpen]);
  return (
    <div className="overlay-anchor" ref={triggerRef}>
      <div className="band-input-pill" onClick={onClick} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderColor: isOpen ? 'var(--color-primary)' : 'var(--color-border)', height: '50px', borderRadius: '50px' }}>
        <div style={{ color: '#888', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>{icon} {label}</div>
        <div style={{ color: 'var(--color-primary)', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '15px' }}>
          {value} <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
        </div>
      </div>
      {isOpen && <div className={`absolute-floating-menu ${placement === 'up' ? 'is-upwards' : ''}`}>{children}</div>}
    </div>
  );
};

export default AddTransactionModal;