import '../onboardingPolicy.ts';
import V05GlobalFeedback from './V05GlobalFeedback.jsx';
import './v05-mobile-fix.css';
import './v05-blueprint-editor-fixes.css';

export default function V05LegacyFrame({ children }) {
  return <>{children}<V05GlobalFeedback/></>;
}
