import { QURAN_JOURNEY_PATH_OFFSETS } from '../../data/quranJourneyAdmin';
import { JourneyNode } from './JourneyNode';

export function JourneyPathView({ nodes, offsets = QURAN_JOURNEY_PATH_OFFSETS, onNodeClick }) {
  return (
    <div className="journey-path" dir="rtl">
      {nodes.map((node, index) => {
        const dx = offsets[index % offsets.length];
        return (
          <div
            key={node.id}
            className="journey-path__item"
            style={{ transform: `translateX(${dx}px)` }}
          >
            <JourneyNode
              label={node.label}
              subtitle={node.subtitle}
              speechBubble={node.speechBubble}
              isDone={node.isDone}
              isActive={node.isActive}
              isLocked={node.isLocked}
              isAdminOpen={node.isAdminOpen}
              isBonus={node.isBonus}
              disabled={!node.canOpen}
              onClick={node.canOpen && onNodeClick ? () => onNodeClick(node) : undefined}
            />
          </div>
        );
      })}
    </div>
  );
}
