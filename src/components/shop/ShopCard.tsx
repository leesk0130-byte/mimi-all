'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, MapPin, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Shop } from '@/types'

interface ShopCardProps {
  shop: Shop
  variant?: 'default' | 'compact'
}

export function ShopCard({ shop, variant = 'default' }: ShopCardProps) {
  const categoryLabel: Record<string, string> = {
    hair: '헤어', nail: '네일', skin: '피부관리',
    lash: '속눈썹', waxing: '왁싱', barber: '바버', makeup: '메이크업',
  }

  if (variant === 'compact') {
    return (
      <Link
        href={`/shop/${shop.id}`}
        className="group block rounded-2xl overflow-hidden bg-card border hover:shadow-lg transition-all duration-300"
      >
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          {shop.thumbnail_url ? (
            <Image
              src={shop.thumbnail_url}
              alt={shop.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-light to-muted flex items-center justify-center">
              <span className="text-3xl font-bold text-brand/30">{shop.name[0]}</span>
            </div>
          )}
          <Badge className="absolute top-2 left-2 bg-white/90 text-foreground text-[10px] backdrop-blur-sm">
            {categoryLabel[shop.category] ?? shop.category}
          </Badge>
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-sm truncate">{shop.name}</h3>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium">{shop.avg_rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({shop.review_count})</span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/shop/${shop.id}`}
      className="group flex gap-4 p-4 rounded-2xl bg-card border hover:shadow-lg transition-all duration-300"
    >
      <div className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-muted">
        {shop.thumbnail_url ? (
          <Image
            src={shop.thumbnail_url}
            alt={shop.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-light to-muted flex items-center justify-center">
            <span className="text-2xl font-bold text-brand/30">{shop.name[0]}</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px]">
            {categoryLabel[shop.category] ?? shop.category}
          </Badge>
        </div>
        <h3 className="font-semibold mt-1 truncate">{shop.name}</h3>
        <div className="flex items-center gap-1 mt-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-sm font-medium">{shop.avg_rating.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">리뷰 {shop.review_count}</span>
        </div>
        {shop.address && (
          <p className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground truncate">
            <MapPin className="w-3 h-3 shrink-0" />
            {shop.address}
          </p>
        )}
      </div>
    </Link>
  )
}
