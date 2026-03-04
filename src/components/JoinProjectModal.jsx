import React, { useState, useEffect } from 'react';
import { ArrowRight, UserPlus } from 'lucide-react'; 
import { supabase } from '../lib/supabaseClient';
import { message } from 'antd';

const JoinProjectModal = ({ isOpen, onClose, project, user, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [unclaimedPersonnel, setUnclaimedPersonnel] = useState([]);
  const [selection, setSelection] = useState('new'); // 'new' or personnel_id
  const [newNickname, setNewNickname] = useState('');

  // ★ 名字匹配函數：計算相似度 (支援無 Email LINE 登入)
  const getNameSimilarity = (name1, name2) => {
    if (!name1 || !name2) return 0;
    const n1 = name1.toLowerCase().trim();
    const n2 = name2.toLowerCase().trim();
    
    // 完全匹配
    if (n1 === n2) return 100;
    
    // 包含匹配
    if (n1.includes(n2) || n2.includes(n1)) return 80;
    
    // 字元共通率
    const chars1 = [...n1];
    const chars2 = [...n2];
    const common = chars1.filter(c => chars2.includes(c)).length;
    return Math.floor((common / Math.max(chars1.length, chars2.length)) * 60);
  };

  // 初始化：讀取該專案「未被認領」的人員名單
  useEffect(() => {
    if (isOpen && project) {
      const fetchPersonnel = async () => {
        // 直接使用 project_id 查詢（移除 invite_code 依賴）
        const { data, error } = await supabase
          .from('personnel')
          .select('*')
          .eq('project_id', project.id)
          .is('linked_user_id', null)
          .order('created_at');

        if (error) {
          console.error('Fetch personnel failed:', error);
        } else {
          let personnel = data || [];
          
          // ★ LINE 登入無 Email 支援：依名字相似度排序
          const userName = user?.user_metadata?.name || '';
          const hasEmail = !!user?.email;
          
          if (!hasEmail && userName) {
            personnel = personnel.map(p => ({
              ...p,
              nameSimilarity: getNameSimilarity(userName, p.name)
            })).sort((a, b) => b.nameSimilarity - a.nameSimilarity);
          }
          
          setUnclaimedPersonnel(personnel);
        }
        
        setNewNickname(user?.user_metadata?.name || '新成員');
      };
      
      fetchPersonnel();
      setSelection('new');
    }
  }, [isOpen, project, user]);

  const handleJoin = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const { error: joinError } = await supabase
        .from('project_members')
        .insert([{
          project_id: project.id,
          user_id: user.id,
          role: 'editor'
        }]);

      if (joinError) throw joinError;

      if (selection === 'new') {
        const { error: createError } = await supabase
          .from('personnel')
          .insert([{
            project_id: project.id,
            name: newNickname,
            linked_user_id: user.id, 
            sort_order: 99
          }]);
        if (createError) throw createError;

      } else {
        const { error: claimError } = await supabase
          .from('personnel')
          .update({ linked_user_id: user.id }) 
          .eq('id', selection);
        if (claimError) throw claimError;
      }

      message.success(`成功加入 ${project.name}！`);
      onSuccess(project); 
      onClose();

    } catch (err) {
      console.error(err);
      if (err.code === '23505') { 
        message.info('你已經是成員囉！');
        onSuccess(project);
        onClose();
      } else {
        message.error('加入失敗：' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !project) return null;

  return (
    <div className={`drawer-overlay ${isOpen ? 'active' : ''}`} style={{zIndex: 2000}}>
      <div className="drawer-container" style={{ padding: '32px 24px', maxWidth: '400px', margin: 'auto', borderRadius: '24px', height: 'auto', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header (固定不捲動) */}
        <div style={{ textAlign: 'center', marginBottom: '24px', flexShrink: 0 }}>
          <div style={{ width: '64px', height: '64px', background: 'var(--color-primary)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 16px -4px rgba(58, 143, 183, 0.4)' }}>
            <UserPlus size={32} color="#fff" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>
            {project.name}
          </h2>
          <p style={{ color: '#888', fontSize: '14px' }}>
            邀請你加入協作
          </p>
        </div>

        {/* 身分選擇區 (可捲動區域) */}
        <div style={{ marginBottom: '24px', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <p style={{ color: '#aaa', fontSize: '13px', fontWeight: '600', marginBottom: '12px', paddingLeft: '4px', flexShrink: 0 }}>
            {!user?.email ? '根據您的名字，以下是建議選項：' : '請問名單中哪一位是你？'}
          </p>
          
          {/* ★ 這裡加上 overflow-y: auto 讓列表可以滑動 */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '10px',
            overflowY: 'auto',
            maxHeight: '50vh', // 限制高度，超過就捲動
            paddingRight: '4px', // 避免捲軸蓋住內容
            paddingBottom: '4px'
          }}>
            
            {/* 選項：我是新成員 */}
            <div 
              onClick={() => setSelection('new')}
              style={{ 
                padding: '16px', 
                borderRadius: '16px', 
                background: selection === 'new' ? 'rgba(58, 143, 183, 0.15)' : 'rgba(255,255,255,0.03)', 
                border: selection === 'new' ? '2px solid var(--color-primary)' : '2px solid transparent',
                cursor: 'pointer',
                transition: '0.2s',
                display: 'flex', alignItems: 'center', gap: '12px',
                flexShrink: 0 // 防止被壓縮
              }}
            >
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: selection === 'new' ? '6px solid var(--color-primary)' : '2px solid #555', boxSizing: 'border-box' }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: '700' }}>我是新成員</div>
                {selection === 'new' && (
                  <input 
                    type="text" 
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                    onClick={(e) => e.stopPropagation()} 
                    placeholder="輸入你的暱稱"
                    style={{ 
                      marginTop: '8px', 
                      width: '100%', 
                      background: '#111', 
                      border: '1px solid #333', 
                      borderRadius: '8px', 
                      padding: '8px 12px', 
                      color: '#fff',
                      outline: 'none'
                    }}
                  />
                )}
              </div>
            </div>

            {/* 選項：既有名單 */}
            {unclaimedPersonnel.map(p => {
              const isHighSimilarity = p.nameSimilarity >= 80;
              const isModerateSimilarity = p.nameSimilarity >= 60 && p.nameSimilarity < 80;
              
              return (
                <div 
                  key={p.id}
                  onClick={() => setSelection(p.id)}
                  style={{ 
                    padding: '16px', 
                    borderRadius: '16px', 
                    background: selection === p.id ? 'rgba(58, 143, 183, 0.15)' : 'rgba(255,255,255,0.03)', 
                    border: selection === p.id ? '2px solid var(--color-primary)' : 
                           (isHighSimilarity ? '2px solid #52c41a' : 
                           (isModerateSimilarity ? '2px solid #faad14' : '2px solid transparent')),
                    cursor: 'pointer',
                    transition: '0.2s',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    flexShrink: 0,
                    position: 'relative'
                  }}
                >
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: selection === p.id ? '6px solid var(--color-primary)' : '2px solid #555', boxSizing: 'border-box' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#fff', fontWeight: '700' }}>我是 {p.name}</div>
                    {isHighSimilarity && (
                      <div style={{ fontSize: '11px', color: '#52c41a', marginTop: '2px' }}>
                        🎯 最佳匹配建議
                      </div>
                    )}
                    {isModerateSimilarity && (
                      <div style={{ fontSize: '11px', color: '#faad14', marginTop: '2px' }}>
                        ⭐ 可能匹配
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

          </div>
        </div>

        {/* Action Buttons (固定在底部) */}
        <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
          <button 
            onClick={onClose}
            style={{ 
              flex: 1, padding: '16px', borderRadius: '16px', 
              background: 'transparent', border: '1px solid #333', 
              color: '#888', fontWeight: '700', cursor: 'pointer' 
            }}
          >
            取消
          </button>
          <button 
            onClick={handleJoin}
            disabled={loading || (selection === 'new' && !newNickname.trim())}
            style={{ 
              flex: 2, padding: '16px', borderRadius: '16px', 
              background: 'var(--color-primary)', border: 'none', 
              color: '#fff', fontWeight: '800', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? '加入中...' : '確認加入'} <ArrowRight size={18} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default JoinProjectModal;