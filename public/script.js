async function generateRecipes() {
    const ingredientsInput = document.getElementById('ingredients');
    const generateButton = document.getElementById('generate');
    const loadingDiv = document.getElementById('loading');
    const resultDiv = document.getElementById('result');
    const nutritionDiv = document.getElementById('nutrition-info');
    
    // 获取所有筛选条件
    const cuisineType = document.querySelector('input[name="cuisine"]:checked').value;
    const cookingTime = document.getElementById('cookingTime').value;
    const taste = document.getElementById('taste').value;
    const isLunchbox = document.getElementById('isLunchbox').checked;
    const isOnePot = document.getElementById('isOnePot').checked;
    const isSimpleTools = document.getElementById('isSimpleTools').checked;

    const ingredients = ingredientsInput.value.trim();
    
    if (!ingredients) {
        alert('请输入食材！');
        return;
    }

    // 禁用按钮和输入
    generateButton.disabled = true;
    ingredientsInput.disabled = true;
    
    // 显示加载动画，隐藏结果
    loadingDiv.style.display = 'block';
    resultDiv.innerHTML = '';
    resultDiv.classList.remove('show');
    nutritionDiv.classList.remove('show');

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                ingredients,
                cuisineType,
                preferences: {
                    cookingTime,
                    taste,
                    isLunchbox,
                    isOnePot,
                    isSimpleTools
                }
            }),
        });

        const data = await response.json();

        if (data.success && data.data.trim()) {
            resultDiv.innerHTML = data.data.replace(/\n/g, '<br>');
            resultDiv.classList.add('show');

            // 显示营养信息
            if (data.nutritionInfo && data.nutritionInfo.length > 0) {
                let nutritionHtml = '<h3>营养信息</h3>';
                data.nutritionInfo.forEach((nutrition, index) => {
                    nutritionHtml += `
                        <div class="recipe-nutrition">
                            <h4>菜品 ${index + 1}</h4>
                            <ul>
                                <li><span>热量：</span><span>${nutrition.calories} 千卡</span></li>
                                <li><span>蛋白质：</span><span>${nutrition.protein}克</span></li>
                            </ul>
                        </div>
                    `;
                });
                nutritionDiv.innerHTML = nutritionHtml;
                nutritionDiv.classList.add('show');
            }
        } else if (data.error) {
            resultDiv.innerHTML = `<span style="color: red;">${data.error}</span>`;
            resultDiv.classList.add('show');
        }
    } catch (error) {
        resultDiv.innerHTML = '<span style="color: red;">抱歉，服务器出现错误，请稍后再试。</span>';
        resultDiv.classList.add('show');
        console.error('Error:', error);
    } finally {
        // 恢复按钮和输入，隐藏加载动画
        generateButton.disabled = false;
        ingredientsInput.disabled = false;
        loadingDiv.style.display = 'none';
    }
}
