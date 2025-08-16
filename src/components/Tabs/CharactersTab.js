"use client";
import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Save, X, User, Crown } from 'lucide-react';
import { charactersAPI, factionsAPI, relationshipsAPI } from '../../lib/api';
import toast from 'react-hot-toast';

const CharacterForm = ({ character, onSave, onCancel, isEdit = false }) => {
  const [formData, setFormData] = useState({
    name: character?.name || '',
    born: character?.born || '',
    faction: character?.faction || '',
    info: character?.info || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      let result;
      if (isEdit) {
        result = await charactersAPI.update(character.id, formData);
        toast.success('Cập nhật nhân vật thành công!');
      } else {
        result = await charactersAPI.create(formData);
        toast.success('Tạo nhân vật mới thành công!');
      }
      onSave(result);
    } catch (error) {
      toast.error(isEdit ? 'Lỗi cập nhật nhân vật!' : 'Lỗi tạo nhân vật!');
      console.error('Character save error:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {isEdit ? 'Chỉnh sửa nhân vật' : 'Thêm nhân vật mới'}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên nhân vật *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập tên nhân vật"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Năm sinh
              </label>
              <input
                type="number"
                value={formData.born}
                onChange={(e) => setFormData({...formData, born: e.target.value ? parseInt(e.target.value) : ''})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Năm sinh"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thế lực
              </label>
              <select
                value={formData.faction}
                onChange={(e) => setFormData({...formData, faction: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Chọn thế lực</option>
                <option value="Thục Hán">Thục Hán</option>
                <option value="Tào Ngụy">Tào Ngụy</option>
                <option value="Đông Ngô">Đông Ngô</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thông tin
              </label>
              <textarea
                value={formData.info}
                onChange={(e) => setFormData({...formData, info: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Thông tin về nhân vật"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo mới')}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <X className="h-4 w-4 mr-2" />
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const RelationshipForm = ({ characters, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    fromName: '',
    toName: '',
    relType: '',
    properties: {}
  });
  const [saving, setSaving] = useState(false);

  const relationTypes = [
    'Nghĩa huynh',
    'Chủ - tướng',
    'Quân sư',
    'Kế thừa',
    'Cha - con',
    'Anh - em',
    'Tình cảm',
    'Đồng minh',
    'Kẻ thù',
    'Từng phục vụ'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const result = await relationshipsAPI.addByNames(
        formData.fromName,
        formData.toName,
        formData.relType,
        formData.properties
      );
      toast.success('Tạo mối quan hệ thành công!');
      onSave(result);
    } catch (error) {
      toast.error('Lỗi tạo mối quan hệ!');
      console.error('Relationship save error:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Thêm mối quan hệ mới
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Từ nhân vật *
              </label>
              <select
                required
                value={formData.fromName}
                onChange={(e) => setFormData({...formData, fromName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Chọn nhân vật</option>
                {characters.map((char) => (
                  <option key={char.id} value={char.name}>
                    {char.name} ({char.faction})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đến nhân vật *
              </label>
              <select
                required
                value={formData.toName}
                onChange={(e) => setFormData({...formData, toName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Chọn nhân vật</option>
                {characters.map((char) => (
                  <option key={char.id} value={char.name}>
                    {char.name} ({char.faction})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại quan hệ *
              </label>
              <select
                required
                value={formData.relType}
                onChange={(e) => setFormData({...formData, relType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Chọn loại quan hệ</option>
                {relationTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Đang lưu...' : 'Tạo mối quan hệ'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <X className="h-4 w-4 mr-2" />
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function CharactersTab() {
  const [characters, setCharacters] = useState([]);
  const [filteredCharacters, setFilteredCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaction, setSelectedFaction] = useState('');
  const [showCharacterForm, setShowCharacterForm] = useState(false);
  const [showRelationshipForm, setShowRelationshipForm] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [factions, setFactions] = useState([]);

  useEffect(() => {
    loadCharacters();
    loadFactions();
  }, []);

  useEffect(() => {
    filterCharacters();
  }, [characters, searchTerm, selectedFaction]);

  const loadCharacters = async () => {
    setLoading(true);
    try {
      const chars = await charactersAPI.list(100);
      setCharacters(chars);
    } catch (error) {
      toast.error('Lỗi tải danh sách nhân vật!');
      console.error('Error loading characters:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFactions = async () => {
    try {
      const factionsData = await factionsAPI.list();
      setFactions(factionsData);
    } catch (error) {
      console.error('Error loading factions:', error);
    }
  };

  const filterCharacters = () => {
    let filtered = characters;
    
    if (searchTerm) {
      filtered = filtered.filter(char =>
        char.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (char.info && char.info.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (selectedFaction) {
      filtered = filtered.filter(char => char.faction === selectedFaction);
    }
    
    setFilteredCharacters(filtered);
  };

  const handleDeleteCharacter = async (character) => {
    if (window.confirm(`Bạn có chắc muốn xóa nhân vật "${character.name}"?`)) {
      try {
        await charactersAPI.delete(character.id);
        toast.success('Xóa nhân vật thành công!');
        loadCharacters();
      } catch (error) {
        toast.error('Lỗi xóa nhân vật!');
        console.error('Error deleting character:', error);
      }
    }
  };

  const handleCharacterSave = (character) => {
    setShowCharacterForm(false);
    setEditingCharacter(null);
    loadCharacters();
  };

  const handleRelationshipSave = (relationship) => {
    setShowRelationshipForm(false);
    // Optionally refresh some data
  };

  const getFactionColor = (faction) => {
    const colors = {
      'Thục Hán': 'bg-green-100 text-green-800',
      'Tào Ngụy': 'bg-blue-100 text-blue-800',
      'Đông Ngô': 'bg-orange-100 text-orange-800',
      'Khác': 'bg-purple-100 text-purple-800'
    };
    return colors[faction] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý nhân vật</h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý thông tin nhân vật và mối quan hệ trong Tam Quốc
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowRelationshipForm(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Crown className="h-4 w-4 mr-2" />
            Thêm mối quan hệ
          </button>
          <button
            onClick={() => setShowCharacterForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm nhân vật
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm theo tên hoặc thông tin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thế lực
            </label>
            <select
              value={selectedFaction}
              onChange={(e) => setSelectedFaction(e.target.value)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tất cả thế lực</option>
              <option value="Thục Hán">Thục Hán</option>
              <option value="Tào Ngụy">Tào Ngụy</option>
              <option value="Đông Ngô">Đông Ngô</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kết quả
            </label>
            <div className="text-sm text-gray-900 py-2">
              Hiển thị {filteredCharacters.length} / {characters.length} nhân vật
            </div>
          </div>
        </div>
      </div>

      {/* Characters List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">Đang tải...</div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredCharacters.map((character) => (
              <li key={character.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <User className="h-10 w-10 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            {character.name}
                          </p>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFactionColor(character.faction)}`}>
                            {character.faction}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          {character.born && `Sinh năm ${character.born} • `}
                          {character.info || 'Không có thông tin'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingCharacter(character)}
                        className="inline-flex items-center p-2 border border-transparent rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCharacter(character)}
                        className="inline-flex items-center p-2 border border-transparent rounded-full text-red-400 hover:text-red-600 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Forms */}
      {showCharacterForm && (
        <CharacterForm
          onSave={handleCharacterSave}
          onCancel={() => setShowCharacterForm(false)}
        />
      )}

      {editingCharacter && (
        <CharacterForm
          character={editingCharacter}
          isEdit={true}
          onSave={handleCharacterSave}
          onCancel={() => setEditingCharacter(null)}
        />
      )}

      {showRelationshipForm && (
        <RelationshipForm
          characters={characters}
          onSave={handleRelationshipSave}
          onCancel={() => setShowRelationshipForm(false)}
        />
      )}
    </div>
  );
}
