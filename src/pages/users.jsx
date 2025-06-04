// src/pages/Users.jsx
import React, { useEffect, useState } from 'react';
import {
  fetchPendingUsers,
  fetchAllUsers,
  validateUser,
  rejectUser,
  deleteUser,
  updateUser
} from '../services/api';
import {
  FiCheckCircle,
  FiXCircle,
  FiEdit2,
  FiEye,
  FiEyeOff,
  FiRefreshCw,
  FiSearch
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import './Users.css';

export default function Users() {
  const [tab, setTab] = useState('pending');
  const [pending, setPending] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [displayed, setDisplayed] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ open: false, user: null, showPass: false });

  useEffect(() => {
    loadData();
  }, [tab]);

  useEffect(() => {
    const list = (tab === 'pending' ? pending : allUsers)
      .filter(u =>
        (u.name || u.username).toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.phone.includes(search)
      );
    setDisplayed(list);
  }, [search, pending, allUsers, tab]);

  async function loadData() {
    try {
      if (tab === 'pending') {
        const data = await fetchPendingUsers();
        setPending(data);
        setDisplayed(data);
      } else {
        const data = await fetchAllUsers();
        setAllUsers(data);
        setDisplayed(data);
      }
    } catch {
      toast.error('Erreur de chargement');
    }
    setSearch('');
  }

  const handleValidate = async id => {
    await validateUser(id);
    toast.success('Utilisateur validé');
    loadData();
  };
  const handleReject = async id => {
    await rejectUser(id);
    toast.info('Inscription rejetée');
    loadData();
  };
  const handleDelete = async id => {
    await deleteUser(id);
    toast.success('Utilisateur supprimé');
    loadData();
  };
  const openEdit = user => {
    setModal({ open: true, user: { ...user, password: '' }, showPass: false });
  };
  const handleModalChange = (field, value) => {
    setModal(m => ({ ...m, user: { ...m.user, [field]: value } }));
  };
  const handleSave = async () => {
    const { user } = modal;
    const payload = { name: user.name, username: user.username, phone: user.phone };
    if (user.password) payload.password = user.password;
    await updateUser(user.id, payload);
    toast.success('Utilisateur mis à jour');
    setModal({ open: false, user: null, showPass: false });
    loadData();
  };

  return (
    <div className="users-page">
      <h2>Gestion des utilisateurs</h2>

      <div className="tab-buttons">
        {['pending', 'all'].map(t => (
          <button
            key={t}
            className={tab === t ? 'active' : ''}
            onClick={() => setTab(t)}
          >
            {t === 'pending' ? 'En attente' : 'Tous les utilisateurs'}
          </button>
        ))}
      </div>

      {/* Barre de recherche toujours visible */}
      <div className="search-bar users-search">
        <FiSearch className="icon" />
        <input
          type="text"
          placeholder="Rechercher par nom, username ou téléphone…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="cards-container">
        {displayed.map(u => (
          <div
            key={u.id}
            className={`user-card ${tab === 'pending' ? 'pending' : ''}`}
          >
            <div className="user-info">
              <div className="avatar">
                {(u.name || u.username)[0].toUpperCase()}
              </div>
              <div>
                <h3>{u.name || u.username}</h3>
                <p className="small">@{u.username}</p>
                <p className="small">{u.phone}</p>
              </div>
            </div>
            <div className="actions">
              {tab === 'pending' ? (
                <>
                  <FiCheckCircle
                    className="icon accept"
                    title="Valider"
                    onClick={() => handleValidate(u.id)}
                  />
                  <FiXCircle
                    className="icon reject"
                    title="Rejeter"
                    onClick={() => handleReject(u.id)}
                  />
                </>
              ) : (
                <>
                  <FiEdit2
                    className="icon edit"
                    title="Modifier"
                    onClick={() => openEdit(u)}
                  />
                  <FiRefreshCw
                    className="icon refresh"
                    title="Mot de passe temporaire"
                    onClick={() => toast.info('Mot de passe temporaire généré')}
                  />
                  {!u.is_admin && (
                    <FiXCircle
                      className="icon delete"
                      title="Supprimer"
                      onClick={() => handleDelete(u.id)}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        ))}
        {displayed.length === 0 && (
          <p className="no-users">
            {tab === 'pending' ? 'Aucun en attente' : 'Aucun utilisateur trouvé'}
          </p>
        )}
      </div>

      {modal.open && (
        <div className="modal-overlay" onClick={() => setModal({ open: false })}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Modifier {modal.user.username}</h3>
            <label>
              Nom
              <input
                value={modal.user.name || ''}
                onChange={e => handleModalChange('name', e.target.value)}
              />
            </label>
            <label>
              Username
              <input
                value={modal.user.username}
                onChange={e => handleModalChange('username', e.target.value)}
              />
            </label>
            <label>
              Téléphone
              <input
                value={modal.user.phone}
                onChange={e => handleModalChange('phone', e.target.value)}
              />
            </label>
            <label className="password-field">
              Mot de passe
              <div className="pass-input">
                <input
                  type={modal.showPass ? 'text' : 'password'}
                  value={modal.user.password}
                  onChange={e => handleModalChange('password', e.target.value)}
                  placeholder="Nouveau mot de passe"
                />
                {modal.showPass ? (
                  <FiEyeOff onClick={() => setModal(m => ({ ...m, showPass: false }))} />
                ) : (
                  <FiEye onClick={() => setModal(m => ({ ...m, showPass: true }))} />
                )}
              </div>
            </label>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setModal({ open: false })}>
                Annuler
              </button>
              <button className="btn-save" onClick={handleSave}>
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
);
}
