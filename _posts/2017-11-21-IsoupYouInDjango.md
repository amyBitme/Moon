---
layout: post
title: "[Personal] IsoupYouInDjango (ft. Python)"
date: 2017-11-21
excerpt: "NBA焦點新聞爬蟲, 自動化存入資料庫"
tags: [Personal, Interview, Python, Django, Drango Q, Heroku, Beautiful Soup]
project: true
comments: false
# feature: assets/img/project/IsoupYouInDjango/02.jpg

---
<!-- # IsoupYouInDjango -->
<figure >
	<img src="/assets/img/project/IsoupYouInDjango/02.png">
	<figurecaption>系統畫面</figurecaption>
</figure>

# IsoupYouInDjango
![heroku](https://screenshots.firefoxusercontent.com/images/5b0fc363-555a-410e-8e42-1373208c1b45.png)

### 1. 抓取 https://nba.udn.com/nba/index?gr=www 中的焦點新聞。   

匯入模組  
```python
import requests
from bs4 import BeautifulSoup
```
設定變數
```python
host = 'https://nba.udn.com'
url = 'https://nba.udn.com/nba/index?gr=www'
data = []
```
對網頁發送請求
```python
response = requests.get(url)
```
解析網頁
```python
soup = BeautifulSoup(response.text,'lxml')
```
鎖定新聞標籤位置
```python
target = soup.find('div', id='news_body')
articles = target.find_all('dt')
```
將所取得資訊傳入變數
```python
for article in articles:
    title = article.find('h3').getText()
    description = article.find("p").getText()
    link = host+article.find("a").get("href")
    period = article.find('b').getText()
    image = article.find("img").get("src")
    content = soupYourContent(link)
    time = content[0][0].getText()
```
以字典型態儲存至`data`
```python
    data.append({'title':title, 'period':period, 'description':description, 'link':link, 'image':image, 'content':content, 'time':time})
```

---

### 2. 使用 Django 設計恰當的 Model，并將所抓取新聞存儲至 DB。  

#### Model

```python
    #焦點標題
    title = models.CharField()

    #焦點敘述 
    description = models.TextField()

    #焦點連結
    link = models.URLField()

    #焦點圖片連結
    image = models.URLField()

    #焦點詳細內容
    content = models.TextField(default='')

    #焦點創立時間
    time = models.DateTimeField(blank=True, null=True)
```

#### 存儲至 DB  

```python
for dict in data:
    Post.objects.create(title=dict['title'], period=dict['period'], description=dict['description'], link=dict['link'], image=dict['image'], content=dict['content'], time=dict['time'])
```

---

### 3. 使用 Django REST Framework 配合 AJAX 實現以下頁面：  
o 焦點新聞列表  
o 新聞詳情頁面  

引用JQuery實作
```javascript
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>     
<!-- 添加放入資料的容器 -->
<div class="container"></div>
```
```diff
    $.ajax({
               url: '/api/post/',
               type: 'get',
               dataType: 'json', 
               success: function(data) {
                   for (var i =0;i<data.length;i++){
                        $('#container').append(
+                            data[i]['title']+
+                            data[i]['content']
                        ); 
                   }
               },
               error: function(data) { 
                   alert('error');
               }
           });              
```

---

### 4.請將代碼提交至個人 github project。  
```
git remote add origin https://github.com/amyBitme/IsoupYouInDjango.git
git push -u origin master
```
---

### 進階要求  
### 5. 實現爬蟲自動定時抓取。  

#### 方法(一)  

安裝`django-Q`  
`apt-get install django-q`  

進入django後台可以設定  
`https://你的網址/admin/django_q/`  

創建`你所建立django app的名稱.爬蟲檔案.函式名稱`  
![set](https://screenshots.firefoxusercontent.com/images/ffef852b-77be-4257-883a-c2f64de7b567.png)

執行排成任務  
`python manage.py qcluster`
![crawler](https://screenshots.firefoxusercontent.com/images/63341a1b-201b-4580-adee-85994cad5f3e.png)

#### 方法(二)
使用Shell script觸發爬蟲函式
```
:loop
start 你的網址/hello
timeout 3600
goto loop
```
### 6. 每當抓取到新的新聞時立即通知頁面。  

建立Json的物件數量起始值以及設立計時器
```javascript 
center><h1 id="status">Update Status</h1></center>
```
```diff
            $(document).ready(function(){               
                var dataLength;
                $.ajax({
                    url: '/api/post/',
                    type: 'get',
                    dataType: 'json', 
                    success: function(data) {
                        <!-- Json物件數量 --> 
                        dataLength = data.length
                        <!-- 以計時器不斷觸發函式-->
+                       setInterval(queryUpdateStatus,5000,dataLength);
                        }
                    },
                    error: function(data) { 
                        alert('error');
                    }
                });

```
請求Json物件數量比對初始建立資料
```javascript
  function queryUpdateStatus(dataLength){
                    $.ajax({
                        url: '/api/post/',
                        type: 'get',
                        dataType: 'json',
                        success: function(data) {
                            tempDataLength = data.length
                            if(dataLength == tempDataLength){
                                $("#status").html("Nothing Updates");
                            }
                            else{
                                $("#status").html("Updated");
                            }
                        }
                    });                  
                }
```

---

### 7. 将本 demo 部署至服务器并可正确运行。  
```
git push Heroku master
```
[heroku_url](http://isoupyouindjango.herokuapp.com/)

## note
# 務必使用linux建立環境, windows無法順利創建部分內容.
### 爬蟲
#### 按照時間排序
```
from dateutil.parser import parse
from news.crawler_1 import soupYou
```
```
news = soupYou()
news = sorted(news, key=lambda x: parse(x['time']))
```
#### 是否已存在資料
`Post.objects.filter(title__contains=dict['title'])`
#### 新聞詳情頁面抓取
`content = soupYourContent(link)`
```diff
def soupYourContent(link):
    url = link
    data =[]
    response = requests.get(url)
    soup = BeautifulSoup(response.text,'lxml')
+   target = soup.find('div',id='story_body_content')
+   article = target.find_all('span')
    data.append(article)
    return data    
```
#### 觸發爬蟲
任意拜訪 網站網址/hello, 觸發hello_world爬蟲函式  
