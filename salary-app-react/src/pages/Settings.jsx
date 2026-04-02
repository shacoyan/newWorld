import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useAppData } from '../hooks/useAppData'
import { generateId } from '../lib/calc'
import Header from '../components/Header'
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SortableItem({ item, onItemChange, onDeleteItem, onBlurSave }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  const style = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: 'relative',
    zIndex: isDragging ? 10 : 0,
  }

  return (
    <div ref={setNodeRef} style={style} className="item-row">
      <div className="drag-handle" {...attributes} {...listeners}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="4" r="1.5"/>
          <circle cx="5" cy="8" r="1.5"/>
          <circle cx="5" cy="12" r="1.5"/>
          <circle cx="11" cy="4" r="1.5"/>
          <circle cx="11" cy="8" r="1.5"/>
          <circle cx="11" cy="12" r="1.5"/>
        </svg>
      </div>
      <input
        type="text"
        placeholder="品目名"
        value={item.name}
        onChange={(e) => onItemChange(item.id, 'name', e.target.value)}
        onBlur={onBlurSave}
      />
      <input
        type="number"
        placeholder="バック"
        value={item.back || ''}
        onChange={(e) => onItemChange(item.id, 'back', e.target.value)}
        onBlur={onBlurSave}
      />
      <button className="btn-delete" onClick={() => onDeleteItem(item.id)}>削除</button>
    </div>
  )
}

export default function Settings() {
  const user = useAuth();
  const { data, persistData } = useAppData(user);
  const navigate = useNavigate();
  const [premiumInput, setPremiumInput] = useState('');
  const [premiumMsg, setPremiumMsg] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    })
  )

  if (!data) return null;

  const s = data.settings;
  const displayName = user?.displayName || user?.email || 'User';

  const castItems = s.items.filter(i => i.category !== 'champagne');
  const champItems = s.items.filter(i => i.category === 'champagne');

  const PREMIUM_CODE = 'KONMANI2026';

  const handlePremiumCode = () => {
    if (premiumInput === PREMIUM_CODE) {
      updateSettings({ isPremium: true });
      setPremiumMsg('プレミアムモードが有効になりました');
    } else {
      setPremiumMsg('コードが正しくありません');
    }
    setPremiumInput('');
  };

  const handleDeactivatePremium = () => {
    updateSettings({ isPremium: false, usePremiumLogo: false, theme: 'default' });
    document.documentElement.removeAttribute('data-theme');
    setPremiumMsg('');
  };

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

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const items = data.settings.items
    const oldIndex = items.findIndex(i => i.id === active.id)
    const newIndex = items.findIndex(i => i.id === over.id)
    if (items[oldIndex].category !== items[newIndex].category) return
    updateSettings({ items: arrayMove(items, oldIndex, newIndex) })
  }

  const handleItemChange = (id, field, value) => {
    updateSettings(prev => ({
      ...prev,
      items: prev.items.map(i =>
        i.id === id ? { ...i, [field]: field === 'back' ? Number(value) : value } : i
      )
    }));
  };

  const handleAddJob = () => {
    const newJob = {
      id: generateId(),
      name: '',
      hourlyRate: 0,
      defaultStartTime: '',
      defaultEndTime: '',
      color: '#FF6B9D',
      nightShiftEnabled: false
    };
    updateSettings(prev => ({
      ...prev,
      jobs: [...(prev.jobs || []), newJob]
    }));
  };

  const handleDeleteJob = (id) => {
    updateSettings(prev => ({
      ...prev,
      jobs: (prev.jobs || []).filter(j => j.id !== id)
    }));
  };

  const handleJobChange = (id, field, value) => {
    updateSettings(prev => ({
      ...prev,
      jobs: (prev.jobs || []).map(j =>
        j.id === id ? { ...j, [field]: field === 'hourlyRate' ? Number(value) : value } : j
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
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>設定</h1>
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
          <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ marginBottom: 0 }}>深夜割増（22:00〜5:00 × 1.25倍）</label>
            <input
              type="checkbox"
              checked={s.nightShiftEnabled ?? false}
              onChange={(e) => updateSettings({ nightShiftEnabled: e.target.checked })}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', flexShrink: 0 }}
            />
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
          <h2 className="section-title">月収目標</h2>
          <div className="form-group">
            <label>目標月収</label>
            <input
              type="number"
              value={s.monthlyGoal || ''}
              placeholder="0（未設定）"
              onChange={(e) => updateSettings({ monthlyGoal: Number(e.target.value) })}
              onBlur={() => persistData(data)}
            />
          </div>
        </section>

        {s.isPremium === true && (
          <section className="section">
            <h2 className="section-title">仕事先管理</h2>
            {(s.jobs || []).map(job => (
              <div key={job.id} style={{ marginBottom: '16px', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: job.color, flexShrink: 0 }} />
                  <strong>{job.name || '（名称未設定）'}</strong>
                  <span style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--text-secondary)' }}>¥{job.hourlyRate}/h</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{job.defaultStartTime}〜{job.defaultEndTime}</span>
                  <button className="btn-delete" onClick={() => handleDeleteJob(job.id)}>削除</button>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="仕事先名"
                    value={job.name}
                    onChange={(e) => handleJobChange(job.id, 'name', e.target.value)}
                    onBlur={() => persistData(data)}
                    style={{ flex: '1 1 120px' }}
                  />
                  <input
                    type="number"
                    placeholder="時給"
                    value={job.hourlyRate || ''}
                    onChange={(e) => handleJobChange(job.id, 'hourlyRate', e.target.value)}
                    onBlur={() => persistData(data)}
                    style={{ flex: '1 1 80px' }}
                  />
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: '1 1 100px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    出勤デフォルト
                    <input
                      type="time"
                      value={job.defaultStartTime || ''}
                      onChange={(e) => handleJobChange(job.id, 'defaultStartTime', e.target.value)}
                      onBlur={() => persistData(data)}
                    />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: '1 1 100px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    退勤デフォルト
                    <input
                      type="time"
                      value={job.defaultEndTime || ''}
                      onChange={(e) => handleJobChange(job.id, 'defaultEndTime', e.target.value)}
                      onBlur={() => persistData(data)}
                    />
                  </label>
                  <input
                    type="color"
                    value={job.color || '#FF6B9D'}
                    onChange={(e) => handleJobChange(job.id, 'color', e.target.value)}
                    onBlur={() => persistData(data)}
                    style={{ width: '40px', height: '36px', padding: '2px', cursor: 'pointer' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: 0 }}>深夜割増（22:00〜5:00 × 1.25倍）</label>
                  <input
                    type="checkbox"
                    checked={job.nightShiftEnabled ?? false}
                    onChange={(e) => handleJobChange(job.id, 'nightShiftEnabled', e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', flexShrink: 0 }}
                  />
                </div>
              </div>
            ))}
            <button className="add-item-btn" onClick={handleAddJob}>+ 仕事を追加</button>
          </section>
        )}

        <section className="section">
          <h2 id="week-start-title" className="section-title">週の始まり</h2>
          <div className="radio-group" role="radiogroup" aria-labelledby="week-start-title" style={{ display:'flex', gap:'16px', marginTop:'12px', padding:'4px 0' }}>
            <label style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'14px', fontWeight:600, color:'var(--text)', cursor:'pointer' }}>
              <input
                type="radio"
                name="weekStartDay"
                value="0"
                checked={(s.weekStartDay ?? 0) === 0}
                onChange={() => updateSettings({ weekStartDay: 0 })}
                style={{ accentColor:'var(--primary)', width:'16px', height:'16px' }}
              />
              日曜始まり
            </label>
            <label style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'14px', fontWeight:600, color:'var(--text)', cursor:'pointer' }}>
              <input
                type="radio"
                name="weekStartDay"
                value="1"
                checked={(s.weekStartDay ?? 0) === 1}
                onChange={() => updateSettings({ weekStartDay: 1 })}
                style={{ accentColor:'var(--primary)', width:'16px', height:'16px' }}
              />
              月曜始まり
            </label>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">品目一覧</h2>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="item-category-label">キャストメニュー</div>
            <SortableContext items={castItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
              {castItems.map(item => (
                <SortableItem
                  key={item.id}
                  item={item}
                  onItemChange={handleItemChange}
                  onDeleteItem={handleDeleteItem}
                  onBlurSave={() => persistData(data)}
                />
              ))}
            </SortableContext>
            <button id="add-item-cast" className="add-item-btn" onClick={() => handleAddItem('cast')}>+ キャストメニューを追加</button>

            <div className="item-category-label">シャンパン類</div>
            <SortableContext items={champItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
              {champItems.map(item => (
                <SortableItem
                  key={item.id}
                  item={item}
                  onItemChange={handleItemChange}
                  onDeleteItem={handleDeleteItem}
                  onBlurSave={() => persistData(data)}
                />
              ))}
            </SortableContext>
            <button id="add-item-champagne" className="add-item-btn" onClick={() => handleAddItem('champagne')}>+ シャンパンを追加</button>
          </DndContext>
        </section>

        <section className="section">
          <h2 className="section-title">プレミアム</h2>
          {s.isPremium ? (
            <div>
              <div className="premium-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                プレミアム有効
              </div>
              <button className="btn-text-danger" onClick={handleDeactivatePremium} style={{ marginTop: '28px', display: 'block' }}>プレミアムを解除</button>
            </div>
          ) : (
            <div>
              <div className="form-group">
                <label>プレミアムコード</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="コードを入力"
                    value={premiumInput}
                    onChange={(e) => setPremiumInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePremiumCode()}
                    style={{ flex: 1 }}
                  />
                  <button className="btn-primary-sm" onClick={handlePremiumCode}>適用</button>
                </div>
                {premiumMsg && <div className="premium-msg">{premiumMsg}</div>}
              </div>
            </div>
          )}
        </section>

        <section className="section">
          <button className="btn-logout-section" onClick={handleLogout}>ログアウト</button>
        </section>
      </main>
    </div>
  );
}
