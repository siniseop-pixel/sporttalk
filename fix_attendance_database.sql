-- ============================================
-- 출석 기능 데이터베이스 오류 수정
-- ============================================

-- 1. attendance_records 테이블에 post_id 컬럼 추가
ALTER TABLE public.attendance_records
ADD COLUMN IF NOT EXISTS post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE;

-- 2. attendance_records 테이블에 streak_count 컬럼 추가
ALTER TABLE public.attendance_records
ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 0 NOT NULL;

-- 3. point_transactions 테이블에 metadata 컬럼 추가
ALTER TABLE public.point_transactions
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- 4. 기존 제약조건 삭제
ALTER TABLE public.point_transactions 
DROP CONSTRAINT IF EXISTS point_transactions_transaction_type_check;

-- 5. 새로운 제약조건 추가 (더 유연한 값 허용)
ALTER TABLE public.point_transactions
ADD CONSTRAINT point_transactions_transaction_type_check 
CHECK (transaction_type IN ('earned', 'spent', 'gifted', 'bonus', 'daily_attendance', 'streak_bonus', 'attendance'));

-- 6. 기본값 설정
UPDATE public.attendance_records SET streak_count = 0 WHERE streak_count IS NULL;
UPDATE public.point_transactions SET transaction_type = 'earned' WHERE transaction_type IS NULL;

-- 7. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_attendance_records_post_id ON public.attendance_records(post_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_user_id_date ON public.attendance_records(user_id, attendance_date);

-- 완료 메시지
SELECT '✅ 출석 기능 데이터베이스 수정 완료!' AS result;
