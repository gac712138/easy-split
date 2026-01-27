import React, { useState, useEffect, useRef } from 'react';
import { X, DollarSign, Type, User, Users, Check, ChevronDown, Tag as TagIcon } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { message } from 'antd';
import dayjs from 'dayjs';
// 引入你提供的響應式日期組件
import ResponsiveDatePicker from './ResponsiveDatePicker'; 

const AddTransactionModal = ({ isOpen, onClose, project, personnel = [], user, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);

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
    <div className={`drawer-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="drawer-container" onClick={(e) => e.stopPropagation()} style={{ padding: '24px' }}>
        <div style={{ width: '40px', height: '5px', background: '#333', borderRadius: '10px', margin: '0 auto 20px' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#fff' }}>新增行程帳務</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
            <X size={24}/>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* 金額大字級 */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '8px', margin: '10px 0 20px' }}>
            <span style={{ fontSize: '20px', color: '#555', fontWeight: 900 }}>NT$</span>
            <input 
              type="number" placeholder="0" value={formData.amount} 
              onChange={e => setFormData({...formData, amount: e.target.value})} 
              style={{ background: 'transparent', border: 'none', fontSize: '48px', fontWeight: '900', color: 'var(--color-primary)', width: '180px', outline: 'none', textAlign: 'center' }} required 
            />
          </div>

          {/* 標題與日期列 */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="band-input-pill" style={{ flex: 1.8, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Type size={14} color="#666" />
              <input 
                type="text" placeholder="標題" value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%' }} required 
              />
            </div>
            {/* 整合你的 ResponsiveDatePicker */}
            <div style={{ flex: 1.2 }}>
              <ResponsiveDatePicker 
                value={dayjs(formData.date)} 
                onChange={(val) => setFormData({...formData, date: val.format('YYYY-MM-DD')})}
                style={{ 
                   // 對齊地基配色
                  backgroundColor: 'var(--color-bg-pill)', 
                  border: '1px solid var(--color-border)',
                  borderRadius: '16px', // 改為與標題一致的圓角
                  height: '50px' 
                }}
              />
            </div>
          </div>

          {/* 墊付/欠款切換滑軌 */}
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

          {/* 智慧判斷方向的選單堆疊 */}
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
            {loading ? '正在儲存...' : '確認新增帳務'}
          </button>
        </form>
      </div>
    </div>
  );
};

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