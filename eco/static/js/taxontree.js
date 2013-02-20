taxontree = function(){
    var tree = new Ext.tree.TreePanel({
        id: 'taxonsTree',
        //autoScroll : true,
        enableDD: false,
        minHeight: 400,
        title: 'Дерево видов',
        getTaxonIdHandler: function(){
            nodes = "";
            checkedNodes = tree.getChecked();
            for (var i = 0; i < checkedNodes.length; i++) {
                if (i>0)
                    nodes=nodes +','+ checkedNodes[i].id;
                else nodes=nodes + checkedNodes[i].id;
            };
            return nodes;
        },        
        loader: new Ext.tree.TreeLoader({
            url : application_root + '/taxon/direct_child',
            baseAttrs: {
                checked: false
            }
        }),
        listeners:{
            'checkchange': function(node, checked) {
                // Выбросить событие 'taxonCheckedChange'
                nodes = this.getTaxonIdHandler();
                taxonEvents.fireEvent('taxonCheckedChange', nodes);
                
                // Если узел был отмечен, то, чтобы не возникало противоречий
                // в "отмечен/не отмечен" дочерний узел,
                // скрыть все дочерние узлы из дерева
                node.eachChild(function(n) {
                    if (checked)
                        n.getUI().hide();
                    else
                        n.getUI().show();
                });
                
                // Вывод сообщения об отметке/снятии в панель сообщений
                if (checked){
                    message = 'Добавлено:';
                } else {
                    message = 'Снято:';
                }
                // Определим родительские таксоны:
                var path = node.getPath('text').split('/');
                path = path.slice(2).join('/');
                path = '(' + path + ')'
                message = [message, node.text, path].join(' ');
                addLog(message);
            },
            'beforeexpandnode': function(node, deep, anim){
                n = node.getUI();
                checked = n.isChecked();
                if (checked) {
                    n.toggleCheck();
                };
            },
            'beforedblclick': function( node, e ){
                return false;
            }
        },
        root: {
            text: 'Все таксоны',
            id: 'root',
            expanded : true,
            draggable: false
        }
    });
    
    return tree;
}
