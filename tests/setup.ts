import { vi } from 'vitest';

// jsdom has no layout or scrolling; keep navigation tests focused on app behavior.
vi.stubGlobal('scrollTo', vi.fn());
