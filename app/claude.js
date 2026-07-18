export default async function handler(req, res) {
  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { model, text } = req.body;

  // Vercel 환경 변수에서 Claude API 키를 가져옴
  const apiKey = process.env.CLAUDE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: '서버에 API 키가 설정되지 않았습니다.' });
  }

  try {
    // Anthropic 공식 Token Counting API 호출
    const response = await fetch('https://api.anthropic.com/v1/messages/count_tokens', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: text }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // 에러 발생 시에도 로그는 남기지 않고 클라이언트로 전달만 함
      return res.status(response.status).json({ error: data.error?.message || 'API 호출 에러' });
    }

    // 성공 시 토큰 수 반환
    return res.status(200).json({ input_tokens: data.input_tokens });

  } catch (error) {
    // 서버 오류 발생 시 보안을 위해 상세 에러 내용 대신 기본 메시지만 전달
    return res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
  }
}
