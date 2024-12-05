require('dotenv').config();
const express = require('express');
const path = require('path');
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL
});

const app = express();
const port = process.env.PORT || 3000;

// 中间件
app.use(express.json());
app.use(express.static('public'));

// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API 路由
app.post('/api/generate', async (req, res) => {
    try {
        const { ingredients, cuisineType, preferences } = req.body;
        
        // 构建烹饪偏好描述
        const preferencesText = [];
        if (preferences.cookingTime !== 'any') {
            preferencesText.push(`烹饪时间在${preferences.cookingTime}分钟以内`);
        }
        if (preferences.taste === 'spicy') {
            preferencesText.push('川香麻辣');
        } else if (preferences.taste === 'healthy') {
            preferencesText.push('低油少盐');
        }
        if (preferences.isLunchbox) {
            preferencesText.push('适合带饭');
        }
        if (preferences.isOnePot) {
            preferencesText.push('一锅就能完成');
        }
        if (preferences.isSimpleTools) {
            preferencesText.push('只需基础厨具');
        }

        const cuisinePrompt = cuisineType === 'chinese' 
            ? '作为一个专业的中餐厨师，请推荐具有中国特色的菜品。'
            : '作为一个专业的西餐厨师，请推荐西式菜品。';
        
        const prompt = `${cuisinePrompt}
根据食材：${ingredients}，推荐3道${preferencesText.join('、')}的美味菜品。每道菜不需要用上所有提供的食材。

对于每道菜，请简要给出：
1. 菜名
2. 所需时间和主要厨具
3. 主料和配料（只列出必需的）
4. 简要烹饪步骤（最多4步）
5. 每份的大致营养成分（热量、蛋白质）

请用简单的自然语言描述，不要使用任何特殊符号，直接用数字标记步骤。确保描述简洁明了。不要输出其余的内容`;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            //model: "gpt-4o",
            model: "claude-3-5-sonnet-20241022",
            temperature: 0.7,
            max_tokens: 800
        });

        // 处理AI返回的内容，移除可能的特殊符号
        let response = completion.choices[0].message.content;
        response = response.replace(/[#\*\-\~\_\`]/g, '');

        // 提取营养信息
        const recipes = response.split(/(?=菜名：)/);
        let formattedResponse = '';
        const nutritionInfo = [];

        recipes.forEach((recipe, index) => {
            if (recipe.trim()) {
                formattedResponse += recipe;
                
                // 提取营养信息
                const nutritionMatch = recipe.match(/每份营养成分：([\s\S]*?)(?=(\n\n|$))/);
                if (nutritionMatch) {
                    const nutrition = {
                        calories: nutritionMatch[1].match(/热量：([\d.]+)卡路里/)?.[1] || "N/A",
                        protein: nutritionMatch[1].match(/蛋白质：([\d.]+)克/)?.[1] || "N/A"
                    };
                    nutritionInfo.push(nutrition);
                }
            }
        });
        
        res.json({ 
            success: true, 
            data: formattedResponse,
            nutritionInfo: nutritionInfo
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            success: false, 
            error: '抱歉，生成菜谱时出现错误，请稍后再试。' 
        });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
