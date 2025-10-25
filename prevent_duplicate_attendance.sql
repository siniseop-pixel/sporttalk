-- 하루에 한 번만 출석 가능하도록 unique 제약조건 추가
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_daily_attendance 
ON public.attendance_records(user_id, attendance_date);

-- 완료 메시지
SELECT '✅ 중복 출석 방지 제약조건 추가 완료!' AS result;
