import React, { useState } from 'react';
import { X, Plus, Users, FileText, Layout } from 'lucide-react';

const CreateProjectModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    members: '',
    description: ''
  });

  // 雖然 CSS 有控制，但 React 層面沒開啟就不渲染內容以提升效能
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
    onClose();
    // 送出後清空表單
    setFormData({ name: '', members: '', description: '' });
  };

  return (
    /* 1. 遮罩層：負責背景變暗與模糊 */
    <div 
      className={`modal-overlay ${isOpen ? 'active' : ''}`} 
      onClick={onClose}
    >
      {/* 2. 抽屜本體：負責由下往上彈出的動畫 */}
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        
        {/* 3. 原生感指示條：暗示可以下滑收起 */}
        <div className="sheet-indicator"></div>

        <div className="sheet-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-text-main)', margin: 0 }}>
            建立新分帳專案
          </h3>
          <button 
            type="button"
            className="close-btn" 
            onClick={onClose}
            style={{ background: '#252525', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}
          >
            <X size={18}/>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="sheet-form">
          {/* 專案名稱 */}
          <div className="input-wrapper">
            <Layout size={18} className="input-icon" />
            <input 
              type="text" 
              placeholder="專案名稱 (例如：虎小島台中專場)" 
              className="band-input"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          {/* 專案人員 */}
          <div className="input-wrapper">
            <Users size={18} className="input-icon" />
            <input 
              type="text" 
              placeholder="專案人員 (用逗號分隔，例如：Andrew, 鄭安志)" 
              className="band-input"
              value={formData.members}
              onChange={(e) => setFormData({...formData, members: e.target.value})}
              required
            />
          </div>

          {/* 備註 */}
          <div className="input-wrapper">
            <FileText size={18} className="input-icon" />
            <textarea 
              placeholder="備註 (選填)" 
              className="band-input"
              style={{ height: '100px', borderRadius: '20px', paddingTop: '15px', resize: 'none' }}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* 確認按鈕：維持藥丸形狀與主色 */}
          <button 
            type="submit" 
            className="band-btn-primary" 
            style={{ marginTop: '10px' }}
          >
            確認建立
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;