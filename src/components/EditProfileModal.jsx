// components/EditProfileModal.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useModal } from '@/components/ModalContext';
import { AnimatePresence, motion } from 'framer-motion';

export default function EditProfileModal({ userId }) {
  const { isModalOpen, closeModal } = useModal(); // Извлекаем из контекста
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('trainee');

  console.log('Modal Open Status: ', isModalOpen); // Логируем состояние модалки

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        alert('Ошибка загрузки профиля');
        console.error(error);
        return;
      }

      setFirstName(data.first_name || '');
      setLastName(data.last_name || '');
      setPhone(data.phone || '');
      setRole(data.role || 'trainee');
      setLoading(false);
    };

    fetchProfile();
  }, [userId]);

  const handleSave = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ first_name: firstName, last_name: lastName, phone, role })
      .eq('id', userId)
      .select();

    if (error) {
      alert('Ошибка при сохранении');
      console.error(error);
      return;
    }

    alert('Профиль обновлён');
    closeModal(); // Закрываем модалку после сохранения
  };

  if (loading) return null;

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          key="edit-modal"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-opacity-50"
        >
          <div className="bg-white p-6 rounded shadow-xl/20 max-w-lg w-full relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl"
            >
              ×
            </button>
            <h2 className="text-lg font-bold text-[#e53740] mb-4">Редактирование профиля</h2>
            <label className="block mb-1">Имя:</label>
            <input
              className="border w-full mb-3 p-2 rounded"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
            />

            <label className="block mb-1">Фамилия:</label>
            <input
              className="border w-full mb-3 p-2 rounded"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
            />

            <label className="block mb-1">Телефон:</label>
            <input
              className="border w-full mb-3 p-2 rounded"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />

            <label className="block mb-1">Роль:</label>
            <select
              className="border w-full mb-4 p-2 rounded"
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="trainee">Стажёр</option>
              <option value="agent">Агент</option>
            </select>

            <button
              onClick={handleSave}
              className="bg-[#e53740] text-white px-4 py-2 rounded hover:bg-[#c72f35] w-full"
            >
              Сохранить
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
