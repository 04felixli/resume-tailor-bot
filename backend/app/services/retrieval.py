import numpy as np
from typing import List, Tuple, Dict
from app.services.embeddings import embed_texts
from app.models.models import Item

def score_bullets_vs_jd_sections(
    bullets: List[str], # n = len(bullets)
    jd_sections: Dict[str, List[str]], # keys are section names, values are lists of strings
    section_weights: Dict[str, float] | None = None, # weights per section name
) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Returns:
      S: (n_bullets, m_sections) cosine similarities
      bullet_scores: (n_bullets,) max similarity over sections
      best_section_idx: (n_bullets,) argmax section per bullet
    """
    # Flatten jd_sections dict into a list and keep track of section keys and indices
    section_keys = []
    section_texts = []
    section_weights_list = []
    if not bullets or not jd_sections:
        return np.zeros((0,0), np.float32), np.zeros((0,), np.float32), np.zeros((0,), np.int64)
    for key, texts in jd_sections.items():
        for t in texts:
            section_keys.append(key)
            section_texts.append(t)
            if section_weights:
                section_weights_list.append(section_weights.get(key, 1.0))
            else:
                section_weights_list.append(1.0)
    B = embed_texts(bullets)          # (n, d), L2-normalized
    Q = embed_texts(section_texts)    # (m, d), L2-normalized
    S = B @ Q.T                       # (n, m) cosine similarities
    if section_weights:
        w = np.asarray(section_weights_list, dtype=np.float32).reshape(1, -1)
        S = S * w                     # broadcast scale by section importance
    best_section_idx = S.argmax(axis=1)
    bullet_scores = S.max(axis=1)
    return S, bullet_scores, best_section_idx

def pick_top_items_from_scores(
    bullet_scores: np.ndarray,
    bullet_to_id: List[str],     
    items_by_id: Dict[str, Item],
    top_x: int,
    shortlist_k: int = 200,
    per_item_cap: int = 3,
    # recency_bonus_fn=None,
    # impact_bonus_fn=None,
) -> List[Item]:
    n = len(bullet_scores)
    k = min(shortlist_k, n)

    # indices of top-k bullets (high recall)
    idx = np.argpartition(bullet_scores, -k)[-k:]
    idx = idx[np.argsort(bullet_scores[idx])[::-1]]

    # collect scores per item
    per_item: Dict[str, List[float]] = {}
    for i in idx:
        item_id = bullet_to_id[i]
        per_item.setdefault(item_id, []).append(float(bullet_scores[i]))

    scored: List[Tuple[str, float]] = []
    for item_id, scores in per_item.items():
        scores.sort(reverse=True)
        total = sum(scores[:per_item_cap])               # cap top-3 bullets
        # it = items_by_id[item_id]

        # if recency_bonus_fn:
        #     total += recency_bonus_fn(it.get("start"), it.get("end"))  # tiny bump

        # if impact_bonus_fn:
        #     total += impact_bonus_fn(it["bullets"])                     # tiny bump

        scored.append((item_id, total))

    scored.sort(key=lambda x: x[1], reverse=True)
    chosen = {iid for iid, _ in scored[:top_x]}

    # return full items (ALL original bullets) for the chosen ids
    # keep original order for determinism
    out = []
    for iid in items_by_id.keys():
        if iid in chosen:
            out.append(items_by_id[iid])
    return out
