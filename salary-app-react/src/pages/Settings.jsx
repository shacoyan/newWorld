import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useAppData } from '../hooks/useAppData'
import { generateId } from '../lib/calc'
import Header from '../components/Header'

export default function Settings() {
  const user = useAuth();
  const { data, persistData } = useAppData(user);
  const navigate = useNavigate();

  if (!data) return null;

  const s = data.settings;
  const displayName = user?.displayName || user?.email || 'User';

  const castItems = s.items.filter(i => i.category !== 'champagne');
  const champItems = s.items.filter(i => i.category === 'champagne');

  const updateSettings = (updater) => {
    const newSettings = typeof updater === 'function' ? updater(data.settings) : { ...data.settings, ...updater };
    persistData({ ...data, settings: newSettings });
  };

  const handleAddItem = (category) => {
    const newItem = {
      id: generateId(),
      name: '',
      back: 0,
      category: category
    };
    updateSettings(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const handleDeleteItem = (id) => {
    updateSettings(prev => ({
      ...prev,
      items: prev.items.filter(i => i.id !== id)
    }));
  };

  const handleItemChange = (id, field, value) => {
    updateSettings(prev => ({
      ...prev,
      items: prev.items.map(i =>
        i.id === id ? { ...i, [field]: field === 'back' ? Number(value) : value } : i
      )
    }));
  };

  const handleLogout = () => {
    signOut(auth).then(() => navigate('/lp'));
  };

  const salaryType = s.salaryType || 'hourly';

  return (
    <div>
      <Header />
      <main style={{ paddingTop: '56px' }}>
        <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>設定</h2>
        </div>
        <section className="section">
          <h2 className="section-title">給与タイプ</h2>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="salaryType"
                value="hourly"
                checked={salaryType === 'hourly'}
                onChange={() => updateSettings({ salaryType: 'hourly' })}
              />
              時給
            </label>
            <label>
              <input
                type="radio"
                name="salaryType"
                value="fixed"
                checked={salaryType === 'fixed'}
                onChange={() => updateSettings({ salaryType: 'fixed' })}
              />
              固定給
            </label>
          </div>

          {salaryType === 'hourly' && (
            <div className="form-group">
              <label>デフォルト時給</label>
              <input
                type="number"
                value={s.defaultHourlyRate || ''}
                onChange={(e) => updateSettings({ defaultHourlyRate: Number(e.target.value) })}
                onBlur={() => persistData(data)}
              />
            </div>
          )}

          {salaryType === 'fixed' && (
            <div className="form-group">
              <label>固定給</label>
              <input
                type="number"
                value={s.baseSalary || ''}
                onChange={(e) => updateSettings({ baseSalary: Number(e.target.value) })}
                onBlur={() => persistData(data)}
              />
            </div>
          )}
        </section>

        <section className="section">
          <h2 className="section-title">出勤設定</h2>
          <div className="form-group">
            <label>デフォルト出勤時刻</label>
            <input
              type="time"
              value={s.defaultStartTime || ''}
              onChange={(e) => updateSettings({ defaultStartTime: e.target.value })}
              onBlur={() => persistData(data)}
            />
          </div>
          <div className="form-group">
            <label>デフォルト退勤時刻</label>
            <input
              type="time"
              value={s.defaultEndTime || ''}
              onChange={(e) => updateSettings({ defaultEndTime: e.target.value })}
              onBlur={() => persistData(data)}
            />
          </div>
          <div className="form-group">
            <label>時刻単位</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="timeStep"
                  value="1"
                  checked={(s.timeStep || 1) === 1}
                  onChange={() => updateSettings({ timeStep: 1 })}
                />
                1分
              </label>
              <label>
                <input
                  type="radio"
                  name="timeStep"
                  value="15"
                  checked={s.timeStep === 15}
                  onChange={() => updateSettings({ timeStep: 15 })}
                />
                15分
              </label>
            </div>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">締め期間設定</h2>
          <div className="form-group">
            <label>開始日</label>
            <input
              type="number"
              min="1"
              max="28"
              value={s.payPeriodStart || ''}
              onChange={(e) => updateSettings({ payPeriodStart: Number(e.target.value) })}
              onBlur={() => persistData(data)}
            />
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">カレンダー設定</h2>
          <div className="form-group">
            <label>週の始まり</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="weekStartDay"
                  value="0"
                  checked={(s.weekStartDay ?? 0) === 0}
                  onChange={() => updateSettings({ weekStartDay: 0 })}
                />
                日曜始まり
              </label>
              <label>
                <input
                  type="radio"
                  name="weekStartDay"
                  value="1"
                  checked={(s.weekStartDay ?? 0) === 1}
                  onChange={() => updateSettings({ weekStartDay: 1 })}
                />
                月曜始まり
              </label>
            </div>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">品目一覧</h2>

          <div className="item-category-label">キャストメニュー</div>
          {castItems.map(item => (
            <div key={item.id} className="item-row">
              <input
                type="text"
                placeholder="品目名"
                value={item.name}
                onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                onBlur={() => persistData(data)}
              />
              <input
                type="number"
                placeholder="バック"
                value={item.back || ''}
                onChange={(e) => handleItemChange(item.id, 'back', e.target.value)}
                onBlur={() => persistData(data)}
              />
              <button className="btn-delete" onClick={() => handleDeleteItem(item.id)}>削除</button>
            </div>
          ))}
          <button id="add-item-cast" className="add-item-btn" onClick={() => handleAddItem('cast')}>+ キャストメニューを追加</button>

          <div className="item-category-label">シャンパン類</div>
          {champItems.map(item => (
            <div key={item.id} className="item-row">
              <input
                type="text"
                placeholder="品目名"
                value={item.name}
                onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                onBlur={() => persistData(data)}
              />
              <input
                type="number"
                placeholder="バック"
                value={item.back || ''}
                onChange={(e) => handleItemChange(item.id, 'back', e.target.value)}
                onBlur={() => persistData(data)}
              />
              <button className="btn-delete" onClick={() => handleDeleteItem(item.id)}>削除</button>
            </div>
          ))}
          <button id="add-item-champagne" className="add-item-btn" onClick={() => handleAddItem('champagne')}>+ シャンパンを追加</button>
        </section>

        <section className="section">
          <button className="btn-logout-section" onClick={handleLogout}>ログアウト</button>
        </section>
      </main>
    </div>
  );
}
