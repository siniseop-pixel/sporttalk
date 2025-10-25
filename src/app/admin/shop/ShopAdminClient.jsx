'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient.js'

export default function ShopAdminClient() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [editing, setEditing] = useState(null)
  
  // 새 아이템 추가 폼
  const [newItem, setNewItem] = useState({
    name: '',
    rarity: 'common',
    stock_quantity: 10,
    item_description: ''
  })

  useEffect(() => {
    loadItems()
  }, [])

  async function loadItems() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('shop_items')
        .select('*')
        .order('rarity', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) {
        console.error('아이템 조회 오류:', error)
        setMessage(`❌ 아이템을 불러올 수 없습니다: ${error.message}`)
        setItems([])
        return
      }
      setItems(data || [])
    } catch (err) {
      console.error('아이템 조회 오류:', err)
      setMessage(`❌ 아이템을 불러올 수 없습니다: ${err.message}`)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  async function handleAddItem() {
    if (!newItem.name.trim()) {
      setMessage('아이템 이름을 입력해주세요.')
      return
    }

    try {
      const { error } = await supabase
        .from('shop_items')
        .insert([{
          name: newItem.name,
          rarity: newItem.rarity,
          stock_quantity: newItem.stock_quantity,
          description: newItem.item_description
        }])

      if (error) throw error

      setMessage('✅ 아이템이 추가되었습니다.')
              setNewItem({
          name: '',
          rarity: 'common',
          stock_quantity: 10,
          item_description: ''
        })
      loadItems()
    } catch (err) {
      console.error('아이템 추가 오류:', err)
      setMessage('❌ 아이템 추가 실패: ' + err.message)
    }
  }

  async function handleUpdateItem(item) {
    try {
      const { error } = await supabase
        .from('shop_items')
        .update({
          name: item.name,
          rarity: item.rarity,
          stock_quantity: item.stock_quantity,
          description: item.description
        })
        .eq('id', item.id)

      if (error) throw error

      setMessage('✅ 아이템이 수정되었습니다.')
      setEditing(null)
      loadItems()
    } catch (err) {
      console.error('아이템 수정 오류:', err)
      setMessage('❌ 아이템 수정 실패: ' + err.message)
    }
  }

  async function handleDeleteItem(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('shop_items')
        .delete()
        .eq('id', id)

      if (error) throw error

      setMessage('✅ 아이템이 삭제되었습니다.')
      loadItems()
    } catch (err) {
      console.error('아이템 삭제 오류:', err)
      setMessage('❌ 아이템 삭제 실패: ' + err.message)
    }
  }

  if (loading) {
    return <div className="text-center py-8">아이템을 불러오는 중...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">상점 아이템 관리</h1>

      {/* 새 아이템 추가 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="font-semibold text-blue-800 mb-3">➕ 새 아이템 추가</h2>
        
        <div className="space-y-3">
          <input
            type="text"
            placeholder="아이템 이름"
            value={newItem.name}
            onChange={e => setNewItem({ ...newItem, name: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
          
          <select
            value={newItem.rarity}
            onChange={e => setNewItem({ ...newItem, rarity: e.target.value })}
            className="w-full border rounded px-3 py-2"
          >
            <option value="common">일반</option>
            <option value="rare">레어</option>
            <option value="epic">에픽</option>
            <option value="legendary">전설</option>
          </select>

          <input
            type="number"
            placeholder="재고 수량"
            value={newItem.stock_quantity}
            onChange={e => setNewItem({ ...newItem, stock_quantity: Number(e.target.value) })}
            className="w-full border rounded px-3 py-2"
            min="0"
          />

          <textarea
            placeholder="아이템 설명"
            value={newItem.item_description}
            onChange={e => setNewItem({ ...newItem, item_description: e.target.value })}
            className="w-full border rounded px-3 py-2"
            rows="2"
          />

          <button
            onClick={handleAddItem}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 active:scale-95"
          >
            추가
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg ${message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message}
        </div>
      )}

      {/* 아이템 목록 */}
      <div>
        <h2 className="text-lg font-semibold mb-3">
          상점 아이템 목록 ({items.length}개)
        </h2>

        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            등록된 아이템이 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <div
                key={item.id}
                className="border rounded-lg p-4 hover:bg-gray-50"
              >
                {editing?.id === item.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editing.name}
                      onChange={e => setEditing({ ...editing, name: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                    <select
                      value={editing.rarity}
                      onChange={e => setEditing({ ...editing, rarity: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="common">일반</option>
                      <option value="rare">레어</option>
                      <option value="epic">에픽</option>
                      <option value="legendary">전설</option>
                    </select>
                    <input
                      type="number"
                      value={editing.stock_quantity}
                      onChange={e => setEditing({ ...editing, stock_quantity: Number(e.target.value) })}
                      className="w-full border rounded px-3 py-2"
                      min="0"
                    />
                    <textarea
                      value={editing.description || ''}
                      onChange={e => setEditing({ ...editing, description: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      rows="2"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateItem(editing)}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-sm text-gray-600">{item.description || '설명 없음'}</div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.rarity === 'common' ? 'bg-gray-100 text-gray-700' :
                        item.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                        item.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {item.rarity === 'common' ? '일반' :
                         item.rarity === 'rare' ? '레어' :
                         item.rarity === 'epic' ? '에픽' : '전설'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>재고: {item.stock_quantity}개</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditing(item)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
