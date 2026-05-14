import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // 상대 경로 빌드를 적용하여, 특정 호스팅 서버나 서브디렉토리 배포 시 유연성을 확보합니다.
});
