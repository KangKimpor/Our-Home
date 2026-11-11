import { useEffect, useRef } from 'react';
import { StageRenderer } from '../stage/StageRenderer';
import { useGameStore } from '../store/gameStore';

export function StageView({ night }: { night: boolean }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<StageRenderer | null>(null);
  const state = useGameStore((s) => s.state);
  const roomId = useGameStore((s) => s.roomId);
  const editMode = useGameStore((s) => s.editMode);
  const selectedUid = useGameStore((s) => s.selectedUid);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const renderer = new StageRenderer(host, {
      onBubble: (bubbleId) => useGameStore.getState().collectBubble(bubbleId),
      onPet: (petId) => {
        const store = useGameStore.getState();
        store.petPet(petId);
        store.openOverlay('pet', petId);
      },
      onVisitor: () => useGameStore.getState().openOverlay('visitors'),
      onSelectItem: (uid) => {
        const store = useGameStore.getState();
        if (store.editMode) {
          store.selectUid(uid);
        } else {
          store.openOverlay('item', uid);
        }
      },
      onMoveItem: (uid, x, y) => {
        useGameStore.getState().moveItem(uid, x, y);
      },
      onStageTap: (x, y) => {
        const store = useGameStore.getState();
        if (store.placingItemId) {
          store.placeItem(store.placingItemId, x, y);
        } else if (store.editMode) {
          store.selectUid(undefined);
        }
      },
    });
    rendererRef.current = renderer;
    return () => {
      renderer.destroy();
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    rendererRef.current?.update({ state, roomId, editMode, selectedUid, night });
  }, [state, roomId, editMode, selectedUid, night]);

  return <div ref={hostRef} className="stage-view" aria-label="Our Home room" />;
}
