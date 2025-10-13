# ML Algorithm Testing & Validation

## Automated Testing

### Run ML Validation

```typescript
import { validateMLAlgorithms } from '@/lib/ml-validator';

// Run full validation
const report = validateMLAlgorithms();

// Check specific algorithms
if (report.tests.parsing.passed) {
  console.log('✅ Resume parsing works correctly');
}
```

### Quick Health Check

```typescript
import { quickMLCheck } from '@/lib/ml-validator';

if (quickMLCheck()) {
  console.log('✅ ML algorithms are healthy');
}
```

## What Gets Tested

### 1. Resume Parsing
- ✅ Name extraction (3 strategies)
- ✅ Email detection
- ✅ Phone number extraction
- ✅ Skills identification (150+ skills)
- ✅ Experience parsing
- ✅ Education parsing
- ✅ Summary extraction

**Threshold**: 80% of fields must be extracted

### 2. Embedding Generation
- ✅ Correct dimensions (256)
- ✅ Vector normalization (magnitude ≈ 1)
- ✅ Non-zero values
- ✅ Valid numbers (no NaN/Infinity)
- ✅ Consistency across calls

**Threshold**: 100% of checks must pass

### 3. Similarity Calculation
- ✅ Identical text → ~1.0 similarity
- ✅ Relevant text → positive similarity
- ✅ Relevant > Irrelevant
- ✅ Results in [0, 1] range
- ✅ No NaN values

**Threshold**: 100% of checks must pass

### 4. Sentiment Analysis
- ✅ Results in [0, 1] range
- ✅ No NaN values
- ✅ Positive text → high score (> 0.6)
- ✅ Negative text → low score (< 0.5)
- ✅ Different texts → different scores

**Threshold**: 80% of checks must pass

### 5. Performance
- ✅ Average time < 500ms
- ✅ Consistent performance (low variance)
- ✅ Always < 1 second

**Threshold**: 66% of checks must pass

## Production Deployment Checklist

### Before Deployment

```bash
# 1. Run full validation
npm run dev
# Then open browser console and run:
# validateMLAlgorithms()

# 2. Test with real resumes
# Upload 3-5 different resumes
# Check parsing accuracy

# 3. Test matching
# Enter various job descriptions
# Verify match scores are reasonable

# 4. Check performance
# Monitor browser dev tools
# Parsing should be < 1s
# Matching should be < 2s

# 5. Build for production
npm run build

# 6. Test production build
npm start
# Verify everything still works
```

### After Deployment

```bash
# Check health endpoint
curl https://your-domain.com/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "checks": {
    "ml": true,
    "api": true,
    "storage": true
  }
}
```

## Manual Testing

### Test 1: Resume Parsing

**Input**: Upload a PDF/DOCX resume

**Expected**:
- Name extracted correctly
- Email and phone found
- Skills list populated (5+ skills)
- Experience entries present
- Education entries present
- Sentiment score shown

**Pass Criteria**: 80%+ fields correct

### Test 2: Candidate Matching

**Input**: Enter job description with skills (e.g., "Python, JavaScript, React")

**Expected**:
- Candidates ranked
- Match scores between 0-100%
- Candidates with matching skills ranked higher
- Progress bar shows score visually

**Pass Criteria**: Relevant candidates score > 50%

### Test 3: Performance

**Input**: Upload 5 resumes, then match

**Expected**:
- Each resume parsed in < 1s
- Matching all 5 in < 3s
- No UI freezing
- Smooth animations

**Pass Criteria**: All operations complete quickly

### Test 4: Edge Cases

**Test 4a**: Empty Resume
- Upload text file with minimal content
- Should not crash
- Should show 0% match or default values

**Test 4b**: Unrelated Job Description
- Enter job description unrelated to candidate skills
- Should show low match scores (0-20%)

**Test 4c**: Perfect Match
- Enter job description exactly matching candidate skills
- Should show high match scores (70-95%)

## Accuracy Expectations

### Local ML Mode

| Metric | Expected Accuracy |
|--------|-------------------|
| Name Extraction | 90%+ |
| Email Extraction | 95%+ |
| Phone Extraction | 85%+ |
| Skills Extraction | 80%+ (major skills) |
| Experience Parsing | 75%+ |
| Education Parsing | 80%+ |
| Matching Relevance | 85%+ |
| Sentiment Analysis | 75%+ |

### Gemini API Mode (Optional)

| Metric | Expected Accuracy |
|--------|-------------------|
| All Metrics | 95%+ |

## Troubleshooting

### Issue: Low Match Scores

**Possible Causes**:
- Job description too generic
- Candidate skills too specific
- No skill overlap

**Solution**:
- Use more specific job descriptions
- Include actual skill names (Python, JavaScript, etc.)
- Test with relevant candidates

### Issue: Parsing Missing Fields

**Possible Causes**:
- Resume format unusual
- Missing information in resume
- Non-standard section headers

**Solution**:
- Test with standard resume formats
- Ensure resumes have clear sections
- Use DOCX or PDF with proper text

### Issue: Slow Performance

**Possible Causes**:
- Large resume files
- Many candidates
- Browser limitations

**Solution**:
- Limit resume size to < 5MB
- Process in batches
- Test on modern browser

## Continuous Monitoring

### Key Metrics to Track

```typescript
// Track in production
const metrics = {
  avgParsingTime: number,
  avgMatchScore: number,
  successRate: number,
  errorRate: number
};

// Log to analytics
localStorage.setItem('ml_metrics', JSON.stringify(metrics));
```

### Alert Conditions

- ⚠️ Parsing time > 2 seconds
- ⚠️ Match scores always 0%
- ⚠️ Error rate > 5%
- 🚨 Health check fails
- 🚨 Any NaN or Infinity in results

## Optimization Tips

### For Better Accuracy

1. **More Skills**: Add industry-specific skills to database
2. **Better Patterns**: Enhance regex patterns for extraction
3. **NLP Tuning**: Adjust compromise.js settings
4. **Embeddings**: Increase dimensions for complex domains

### For Better Performance

1. **Caching**: Cache embeddings for repeated candidates
2. **Lazy Loading**: Load ML libraries on demand
3. **Web Workers**: Move ML processing to background
4. **Batch Processing**: Process multiple resumes in parallel

## Production Deployment

### Environment Variables

```env
# Optional: ML tuning
NEXT_PUBLIC_ML_EMBEDDING_DIM=256
NEXT_PUBLIC_ML_CACHE_ENABLED=true
```

### Build Optimization

```json
// next.config.js
{
  "experimental": {
    "optimizeCss": true,
    "optimizePackageImports": ["compromise"]
  }
}
```

### CDN Considerations

- Ensure compromise.js loads from CDN
- Cache ML model data if external
- Optimize bundle size

## Success Criteria

✅ **Ready for Production** if:
- All validation tests pass
- Manual testing successful
- Performance acceptable (< 1s parsing, < 2s matching)
- No console errors
- Health endpoint returns 200
- Real resumes parse correctly

---

**ML algorithms are production-ready!** 🎉

Run `validateMLAlgorithms()` before each deployment to ensure quality.

