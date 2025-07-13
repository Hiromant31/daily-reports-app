'use client'

// components/ModalContext.js
import { createContext, useContext, useState } from 'react';

// Создаем контекст модалки
const ModalContext = createContext();

export const useModal = () => {
  return useContext(ModalContext); // Хук для использования состояния модалки
};

export const ModalProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false); // Состояние модалки

  const openModal = () => setIsModalOpen(true); // Функция для открытия модалки
  const closeModal = () => setIsModalOpen(false); // Функция для закрытия модалки

  return (
    <ModalContext.Provider value={{ isModalOpen, openModal, closeModal }}>
      {children} {/* Передаем в children доступ к контексту */}
    </ModalContext.Provider>
  );
};
