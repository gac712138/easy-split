import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

const InviteHandler = ({ user, onInvitationDetected, onAlreadyMember }) => {
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('projectId');

    // 只有在網址有 projectId 且使用者已登入的情況下執行
    if (projectId && user && !isProcessingRef.current) {
      isProcessingRef.current = true;

      const handleInvitation = async () => {
        try {
          // 直接從 projects 表查詢專案資料（移除 invite_code 依賴）
          const { data: project, error } = await supabase
            .from('projects')
            .select('id, name, status, user_id')
            .eq('id', projectId)
            .single();

          if (error || !project) {
            console.error('專案 ID 無效或專案不存在');
            return;
          }

          // 檢查是否已經是成員
          const { data: membership } = await supabase
            .from('project_members')
            .select('id')
            .eq('project_id', project.id)
            .eq('user_id', user.id)
            .maybeSingle();

          if (membership) {
            onAlreadyMember(project);
          } else {
            // 觸發 Dashboard 開啟認領視窗
            onInvitationDetected(project);
          }
        } catch (err) {
          console.error('處理邀請失敗:', err);
        } finally {
          // 保留 projectId 在 URL 上作為乾淨狀態
          const newUrl = new URL(window.location);
          newUrl.searchParams.delete('liff.state'); // 清理 LIFF state
          window.history.replaceState({}, '', newUrl.pathname + newUrl.search);
        }
      };

      handleInvitation();
    }
  }, [user, onInvitationDetected, onAlreadyMember]);

  return null;
};

export default InviteHandler;