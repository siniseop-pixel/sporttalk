-- shop_items 테이블에 stock_quantity 컬럼 추가
ALTER TABLE public.shop_items
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0 NOT NULL;

-- 기존 레코드의 stock_quantity 값을 0으로 설정
UPDATE public.shop_items SET stock_quantity = 0 WHERE stock_quantity IS NULL;
