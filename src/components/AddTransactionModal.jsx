import React, { useState, useEffect } from 'react';
import { X, DollarSign, Type, User, Users, Calendar, Check, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { message, DatePicker, ConfigProvider } from 'antd';
import dayjs from 'dayjs';

const AddTransactionModal = ({ isOpen, onClose, project, personnel = [], user, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null); // 'cat' | 'payer' | 'part'

  const [formData, setFormData] = useState({
    title: '', amount: '', type: 'advance', category_id: null,
    date: dayjs().format('YYYY-MM-DD'), payer_id: null,
    debtor_id: null, participants: [], description: ''
  });

  useEffect(() => {
    if (isOpen && project) {
      supabase.from('categories').select('*').order('name').then(({ data }) => {
        if (data?.length > 0) {
          setCategories(data);
          setFormData(prev => ({ ...prev, category_id: data[0].id }));
        }
      });
      const memberIds = project.project_members?.map(pm => pm.personnel?.id).filter(Boolean) || [];
      const myId = personnel?.find(p => p.name === '安志')?.id || memberIds[0];
      setFormData(prev => ({ ...prev, payer_id: myId, participants: memberIds }));
    }
  }, [isOpen, project, personnel]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || !formData.amount || !formData.payer_id) return;
    setLoading(true);
    try {
      const { data: tx, error: tError } = await supabase.from('transactions').insert([{
        project_id: project.id, user_id: user.id, title: formData.title.trim() || '未命名項目',
        amount: parseFloat(formData.amount), type: formData.type, category_id: formData.category_id,
        date: formData.date, payer_id: formData.payer_id,
        debtor_id: formData.type === 'debt' ? formData.debtor_id : null,
      }]).select().single();
      if (tError) throw tError;
      if (formData.type === 'advance') {
        const payload = formData.participants.map(pid => ({ transaction_id: tx.id, personnel_id: pid, user_id: user.id }));
        await supabase.from('transaction_participants').insert(payload);
      }
      message.success('記帳成功'); onClose(); onRefresh();
    } catch (err) { message.error(err.message); } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  const getCategoryName = (id) => categories.find(c => c.id === id)?.name || '請選擇類型';
  const getPersonnelName = (id) => personnel?.find(p => p.id === id)?.name || '未選擇';

  return (
    <div className="modal-overlay active" onClick={onClose} style={{ zIndex: 5001 }}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-indicator"></div>
        <div className="sheet-header">
          <h3 className="modal-title">新增行程帳務</h3>
          <button onClick={onClose} className="close-btn"><X size={24}/></button>
        </div>

        <form onSubmit={handleSubmit} className="band-form-layout">
          {/* 金額區 */}
          <div className="amount-hero-box">
            <span className="unit">NT$</span>
            <input type="number" placeholder="0" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="huge-input" required />
          </div>

          <div className="input-pill-container">
            <div className="pill-main">
              <Type size={14} color="#666" />
              <input type="text" placeholder="標題" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            </div>
            <ConfigProvider theme={{ token: { colorBgContainer: 'transparent', colorText: '#fff' } }}>
              <DatePicker className="pill-date" suffixIcon={null} placeholder="日期" value={dayjs(formData.date)} onChange={(d, s) => setFormData({...formData, date: s})} />
            </ConfigProvider>
          </div>

          <div className="segmented-wrapper">
            <div className={`active-slide ${formData.type}`}></div>
            <button type="button" className={formData.type === 'advance' ? 'active' : ''} onClick={() => setFormData({...formData, type: 'advance'})}>墊付</button>
            <button type="button" className={formData.type === 'debt' ? 'active' : ''} onClick={() => setFormData({...formData, type: 'debt'})}>欠款</button>
          </div>

          {/* 懸浮式清單區域 - 核心不擠壓設計 */}
          <div className="selection-group-stack">
            
            {/* 1. 類型選擇器 */}
            <div className="overlay-container">
              <SelectionPill label="類型" value={getCategoryName(formData.category_id)} icon={<Tag size={14}/>} isOpen={activeMenu === 'cat'} onClick={() => setActiveMenu(activeMenu === 'cat' ? null : 'cat')} />
              {activeMenu === 'cat' && (
                <div className="floating-list shadow-lg">
                  {categories.map(c => (
                    <div key={c.id} className={`list-row ${formData.category_id === c.id ? 'active' : ''}`} onClick={() => { setFormData({...formData, category_id: c.id}); setActiveMenu(null); }}>
                      {c.name} {formData.category_id === c.id && <Check size={16} />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. 付款人選擇器 */}
            <div className="overlay-container">
              <SelectionPill label="付款人" value={getPersonnelName(formData.payer_id)} icon={<User size={14}/>} isOpen={activeMenu === 'payer'} onClick={() => setActiveMenu(activeMenu === 'payer' ? null : 'payer')} />
              {activeMenu === 'payer' && (
                <div className="floating-list shadow-lg">
                  {personnel?.map(p => (
                    <div key={p.id} className={`list-row ${formData.payer_id === p.id ? 'active' : ''}`} onClick={() => { setFormData({...formData, payer_id: p.id}); setActiveMenu(null); }}>
                      {p.name} {formData.payer_id === p.id && <Check size={16} />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. 參與成員選擇器 */}
            <div className="overlay-container">
              <SelectionPill label={formData.type === 'advance' ? "參與分擔" : "欠款人"} value={formData.type === 'advance' ? `${formData.participants.length} 人參與` : getPersonnelName(formData.debtor_id)} icon={<Users size={14}/>} isOpen={activeMenu === 'part'} onClick={() => setActiveMenu(activeMenu === 'part' ? null : 'part')} />
              {activeMenu === 'part' && (
                <div className="floating-list shadow-lg">
                  {personnel?.map(p => {
                    const isChecked = formData.type === 'advance' ? formData.participants.includes(p.id) : formData.debtor_id === p.id;
                    return (
                      <div key={p.id} className={`list-row ${isChecked ? 'active' : ''}`} onClick={() => {
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
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="band-main-btn" disabled={loading}>
            確認新增帳務
          </button>
        </form>
      </div>
    </div>
  );
};

// 輔助組件：Pill 樣式觸發器
const SelectionPill = ({ label, value, icon, onClick, isOpen }) => (
  <div className={`pill-trigger-box ${isOpen ? 'active' : ''}`} onClick={onClick}>
    <div className="label">{icon} {label}</div>
    <div className="value">{value} <ChevronDown size={14} className={`arrow ${isOpen ? 'up' : ''}`} /></div>
  </div>
);

const Tag = ({ size }) => <DollarSign size={size} />; // 補齊類型 icon

export default AddTransactionModal;