import { create } from 'zustand';

const initialState = {
  isCreateModalOpen: false,
  isEditProjectModalOpen: false,
  isAddTransactionOpen: false,
  isJoinModalOpen: false,
  isLogoutConfirmOpen: false,
  isSetupModalOpen: false,
  modalData: {}, // 可存放每個 modal 的額外資料
};

export const useModalStore = create((set) => ({
  ...initialState,
  openModal: (name, data = null) =>
    set((state) => ({
      [`is${capitalize(name)}ModalOpen`]: true,
      modalData: { ...state.modalData, [name]: data },
    })),
  closeModal: (name) =>
    set((state) => ({
      [`is${capitalize(name)}ModalOpen`]: false,
      modalData: { ...state.modalData, [name]: null },
    })),
  resetModals: () => set(initialState),
}));

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
