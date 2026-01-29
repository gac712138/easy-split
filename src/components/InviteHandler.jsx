import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

const InviteHandler = ({ user, onInvitationDetected, onAlreadyMember }) => {
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    // 只有在網址有 code 且使用者已登入的情況下執行
    if (code && user && !isProcessingRef.current) {
      isProcessingRef.current = true;

      // InviteHandler.jsx 核心修復片段
const handleInvitation = async () => {
  try {
    // ★ 修改處：改用 rpc 查詢專案預覽，避免 RLS 導致的 406 錯誤
    const { data: projects, error } = await supabase.rpc('get_project_preview_by_code', {
      p_invite_code: code
    });

    if (error || !projects || projects.length === 0) {
      console.error('邀請碼無效');
      return;
    }

    const project = projects[0];

    // 檢查是否已經是成員 (這部分維持原樣)
    const { data: membership } = await supabase
      .from('project_members')
      .select('id')
      .eq('project_id', project.id)
      .eq('user_id', user.id)
      .maybeSingle(); // 使用 maybeSingle 避免報錯

    if (membership) {
      onAlreadyMember(project);
    } else {
      // 觸發 Dashboard 開啟認領視窗
      onInvitationDetected(project);
    }
  } catch (err) {
    console.error('處理邀請失敗:', err);
  } finally {
    const newUrl = window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }
};

      handleInvitation();
    }
  }, [user, onInvitationDetected, onAlreadyMember]);

  return null;
};

export default InviteHandler;