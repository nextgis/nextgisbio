<% 
    from nextgisbio.utils.DictionaryMissingValues import DictionaryMissingValues
%>

% for card in result['Records']:
    
\begin{center}
\LARGE
ИНФОРМАЦИОННАЯ КАРТОЧКА \break встреч растений и грибов, занесенных в Красную книгу \break Ханты-Мансийского автономного округа
\end{center}

\begin{center}
\large
\textbf{${card['taxon__name']}} \break
${card['taxon__russian_name']} \break
№ ${card['cards__id']}
\end{center}

**Место находки:** ${ card['cards__location'] if card['cards__location'] else u'не описано' }

**Долгота:** ${card['cards__lon'] if card['cards__lon'] else u'информации нет' }
**Широта:** ${card['cards__lat'] if card['cards__lat'] else u'информации нет' }

**Местообитание:** ${ card['cards__habitat'] if card['cards__habitat'] else u'информации нет' }

**Антропогенная нагрузка:** ${ card['cards__anthr_press'] if card['cards__anthr_press'] else u'информации нет' } 

**Лимитирующие факторы:** ${ card['cards__limit_fact'] if card['cards__limit_fact'] else u'информации нет' } 

**Меры защиты:** ${ card['cards__protection'] if card['cards__protection'] else u'информации нет' } 

**Фаза жизненного цикла:** ${ card['cards__pheno'] if card['cards__pheno'] else u'информации нет' }
 
**Количество:** ${ card['cards__quantity'] if card['cards__quantity'] else u'информации нет' } 

**Площадь популяции:** ${ card['cards__area'] if card['cards__area'] else u'информации нет' } 

**Примечания:** ${ card['cards__notes'] if card['cards__notes'] else u'примечаний нет' }  

**Музейные образцы:** ${ card['cards__museum'] if card['cards__museum'] else u'информации нет' } 

**Источник информации:** ${ card['cards__publications'] if card['cards__publications'] else u'информации нет' } 

<% card_for_rendering = DictionaryMissingValues(card) %>
**Наблюдал:** ${ card_for_rendering.get_value('observer__name', u'информации нет') } 

<!--**Определил:** ${ card['cards__identifier'] if card['cards__identifier'] else u'информации нет' } -->

<!--**Вносил:** ${ card['cards__inserter'] if card['cards__inserter'] else u'информации нет' } -->

\newpage

% endfor