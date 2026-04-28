/**
 * DesignEditor entry point.
 *
 * All logic lives in DesignEditor/DesignEditorPage.tsx.
 * This file exists solely so TypeScript module resolution
 * (which prefers a .tsx file over a same-named directory) continues
 * to satisfy imports like `import DesignEditor from '@/pages/DesignEditor'`
 * without any changes to App.tsx or any other consumer.
 *
 * Sub-modules (hooks, services, engine, components) are re-exported
 * from DesignEditor/index.tsx and can be imported from '@/pages/DesignEditor'
 * via the barrel.
 */
export { default } from './DesignEditor/DesignEditorPage';
