import { assessmentQuestions, archetypes } from '../data/archetypes.js';
import { getRecommendedArchetype } from '../engine/gameEngine.js';

export default function Assessment({ answers, onAnswer, onFinish, recommendedArchetypeId, onChooseRecommendation }) {
  const isComplete = answers.length === assessmentQuestions.length;
  const recommendation = recommendedArchetypeId
    ? archetypes.find((item) => item.id === recommendedArchetypeId)
    : null;

  return (
    <section className="panel panel--hero">
      <div className="eyebrow">创作倾向测评 / 档案推荐</div>
      <h1>新媒体艺术时间模拟器</h1>
      <p className="lead">
        一份关于创作方法、预算压力与场域关系的可玩档案。接管一份艺术家履历，在一个创作周期里决定它的走向。
      </p>

      {!isComplete ? (
        <div className="assessment-list">
          {assessmentQuestions.map((question, index) => (
            <div className="question-card" key={question.id}>
              <div className="question-index">Q{index + 1}</div>
              <h3>{question.title}</h3>
              <div className="option-grid">
                {question.options.map((option) => {
                  const selected = answers[index]?.label === option.label;
                  return (
                    <button
                      key={option.label}
                      className={`option-button ${selected ? 'is-selected' : ''}`}
                      onClick={() => onAnswer(index, option)}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="button-row">
            <button
              className="primary-button"
              disabled={answers.length !== assessmentQuestions.length}
              onClick={() => onFinish(getRecommendedArchetype(answers))}
            >
              生成推荐档案
            </button>
          </div>
        </div>
      ) : (
        <div className="recommend-card">
          <div className="eyebrow">推荐结果</div>
          <h2>{recommendation?.name}</h2>
          <p>{recommendation?.description}</p>
          <div className="tag-row">
            {recommendation?.tags.map((tag) => (
              <span className="tag" key={tag}>{tag}</span>
            ))}
          </div>
          <div className="button-row">
            <button className="primary-button" onClick={() => onChooseRecommendation(recommendation?.id)}>
              接管这份档案
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
