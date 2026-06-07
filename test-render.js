import React from 'react';
import { renderToString } from 'react-dom/server';
import { DetailModal } from './src/components/domain/DetailModal.jsx';

try {
  // Mock out things that might fail in Node
  global.localStorage = { getItem: () => null, setItem: () => {} };
  global.navigator = { clipboard: { writeText: () => {} } };
  global.prompt = () => null;
  global.confirm = () => false;
  
  const html = renderToString(React.createElement(DetailModal, {
    candidate: { id: 'c1', name: 'Test' },
    report: { conditionScore: 10, trustScore: 6, realityScore: 4, rows: [] },
    close: () => {},
    onUpdate: () => {},
    activeTab: 'spec'
  }));
  console.log("SUCCESS!");
} catch (e) {
  console.error("ERROR:");
  console.error(e.message);
}
