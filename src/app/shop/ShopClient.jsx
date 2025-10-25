// src/app/shop/ShopClient.jsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient.js'
import PointBalance from '@/components/PointBalance.jsx'

export default function ShopClient({ items = [] }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [userBalance, setUserBalance] = useState(0)

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100'
      case 'rare': return 'text-blue-600 bg-blue-100'
      case 'epic': return 'text-purple-600 bg-purple-100'
      case 'legendary': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRarityLabel = (rarity) => {
    switch (rarity) {
      case 'common': return '일반'
      case 'rare': return '레어'
      case 'epic': return '에픽'
      case 'legendary': return '전설'
      default: return '일반'
    }
  }

  const handlePurchase = async () => {
    if (loading) return
    
    setLoading(true)
    setResult(null)
    
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user?.user) {
        alert('로그인이 필요합니다.')
        return
      }

      const { data, error } = await supabase
        .rpc('purchase_random_box', {
          user_uuid: user.user.id
        })

      if (error) throw error

      if (data.success) {
        setResult({
          success: true,
          item: data
        })
        
        // 포인트 잔액 새로고침을 위해 페이지 새로고침
        window.location.reload()
      } else {
        setResult({
          success: false,
          message: data.message
        })
      }

    } catch (error) {
      console.error('랜덤박스 구매 오류:', error)
      setResult({
        success: false,
        message: '구매 중 오류가 발생했습니다: ' + error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 포인트 잔액 표시 */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-800">현재 포인트</h3>
            <PointBalance />
          </div>
          <div className="text-sm text-blue-600">
            랜덤박스 1개 = 10,000P
          </div>
        </div>
      </div>

      {/* 랜덤박스 구매 */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border-2 border-purple-200">
        <h3 className="text-lg font-bold mb-4 text-purple-800">🎁 랜덤박스</h3>
        
        <div className="mb-4">
          <p className="text-gray-700 mb-2">
            다양한 아이템이 들어있는 신비한 박스입니다!
          </p>
          <p className="text-sm text-gray-600">
            구매 시 아래 아이템 중 하나가 랜덤으로 지급됩니다.
          </p>
        </div>

        <button
          onClick={handlePurchase}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {loading ? '구매 중...' : '🎁 랜덤박스 구매 (10,000P)'}
        </button>

        {result && (
          <div className={`mt-4 p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            {result.success ? (
              <div>
                <h4 className="font-semibold text-green-800 mb-2">🎉 축하합니다!</h4>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRarityColor(result.item.rarity)}`}>
                  {getRarityLabel(result.item.rarity)}
                </div>
                <p className="mt-2 font-semibold">{result.item.item_name}</p>
                <p className="text-sm text-gray-600">{result.item.item_description}</p>
              </div>
            ) : (
              <p className="text-red-800">{result.message}</p>
            )}
          </div>
        )}
      </div>

      {/* 상점 아이템 목록 */}
      <div>
        <h3 className="text-lg font-bold mb-4">📦 상점 아이템 목록</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold">{item.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(item.rarity)}`}>
                  {getRarityLabel(item.rarity)}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{item.description}</p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">재고: {item.stock_quantity}개</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 확률 정보 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold mb-3">📊 아이템 확률</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="text-center">
            <div className="text-gray-600">일반</div>
            <div className="font-semibold">50%</div>
          </div>
          <div className="text-center">
            <div className="text-blue-600">레어</div>
            <div className="font-semibold">25%</div>
          </div>
          <div className="text-center">
            <div className="text-purple-600">에픽</div>
            <div className="font-semibold">15%</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-600">전설</div>
            <div className="font-semibold">10%</div>
          </div>
        </div>
      </div>
    </div>
  )
}
