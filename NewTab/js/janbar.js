/* http://www.jq22.com/jquery-info21547 */
function callback(data) { /*jsonp回调*/ }
var helangSearch = { /* 元素集 */
  els: {},
  searchIndex: 0,
  /* 搜索类型序号 */
  wordColor: ['#ff2c00', '#ff5a00', '#ff8105', '#fd9a15', '#dfad1c', '#6bc211', '#3cc71e', '#3cbe85', '#51b2ef', '#53b0ff'],
  searchArr: ['https://www.baidu.com/s?ie=utf-8&tn=baidu&wd=', 'https://www.google.com.hk/search?hl=zh-CN&q='],
  imagesArr: ['baidu', 'google'],
  init: function() { /* 初始化 */
    var _this = this;
    this.els = {
      pickerBtn: $(".picker"),
      pickerList: $(".picker-list"),
      input: $("#search-input"),
      logo: $(".logo"),
      hotList: $(".hot-list"),
      button: $(".search")
    };

    switch (localStorage.getItem('index')) {
    case "1":
      _this.searchIndex = 1;
      break;
    default:
      localStorage.setItem('index', 0);
    case "0":
      _this.searchIndex = 0;
      break;
    }
    var switch_image = function(index) {
        _this.els.pickerBtn.css('background-image', 'url(img/ico_' + _this.imagesArr[index] + '.png)');
        _this.els.logo.css('background-image', 'url(img/' + _this.imagesArr[index] + '.png)');
      }
    switch_image(_this.searchIndex);
    var push_search = function(text) {
        if (text != '') {
          var arr = [text]; /* 最后搜索放到最前面 */
          var search = localStorage.getItem('search');
          if (typeof search == 'string') {
            try {
              JSON.parse(search).forEach(function(item,index) {
                if (index >= 9) { return; } /* 最多保留10个历史记录 */
                if (item != text) { arr.push(item); } /* 已经搜索过的不重复记录 */
              });
            } catch(e) {}
          }
          localStorage.setItem('search', JSON.stringify(arr));
        } /* 写入搜索记录,并立即搜索 */
        window.location = _this.searchArr[_this.searchIndex] + text;
      }
    var hot_click = function(arr) {
        if (arr.length <= 0) {return;}
        var str = '';
        arr.forEach(function(item, index) {
          str += '<a class="hot-click" data-wd="'+item+'"><div class="number" style="color:'
              +_this.wordColor[index]+'">'+(index+1)+'</div><div>'+item+'</div></a>';
        });
        _this.els.hotList.html(str);
        $('.hot-click').click(function () { push_search($(this).data('wd')); });
        tmp_select = -1;
        tmp_hot_list = arr; /* 缓存本次热词数据 */
        setTimeout(function(){_this.els.hotList.show();},100);
      }

    this.els.pickerBtn.click(function() { /* 搜索类别选择按钮 */
      if (_this.els.pickerList.is(':hidden')) {
        setTimeout(function(){_this.els.pickerList.show();},100);
      }
    });
    this.els.pickerList.on('click', '>li', function() {
      _this.searchIndex = $(this).index(); /* 搜索类别选择列表 */
      switch_image(_this.searchIndex);
      localStorage.setItem('index', _this.searchIndex);
    });
    this.els.input.click(function () { /* 点击搜索框,显示搜索记录 */
      if (_this.els.hotList.is(':hidden')) {
        hot_click(JSON.parse(localStorage.getItem('search') || '[]'));
      }
    });

    var flag, tmp_text, tmp_select, tmp_hot_list;
    var keyup_keydown = function(isUp) {
      if (tmp_select < 0) {
        tmp_select = isUp ? tmp_hot_list.length-1 : 0;
      } else {
        $('.hot-click').eq(tmp_select).removeAttr('style');
        if (isUp) {
          tmp_select = tmp_select == 0 ? tmp_hot_list.length-1 : tmp_select-1;
        } else {
          tmp_select = tmp_select == tmp_hot_list.length-1 ? 0 : tmp_select+1;
        }
      } /* 上下键循环选中热词 */
      _this.els.input.val(tmp_hot_list[tmp_select]);
      $('.hot-click').eq(tmp_select).css('background-color', '#f3f3f3');
    }
    this.els.input.keyup(function(e) {
      var text = _this.els.input.val().trim();
      if (e.which == 13) {
        push_search(text);
        return false; /* 松开回车 */
      } else if (e.which == 38 || e.which == 40) {
        keyup_keydown(e.which == 38);
        return false; /* 松开上下建 */
      }
      if (text == '' || text == tmp_text) {
        return; /* 避免频繁请求 */
      }

      clearTimeout(flag);
      tmp_text = text;
      flag = setTimeout(function() {
        $.ajax({
          url: 'https://www.baidu.com/sugrec?prod=pc&wd=' + text,
          type: 'GET',
          dataType: 'jsonp',
          jsonp: 'callback',
          jsonpCallback: 'callback',
          timeout: 2000,
          contentType: 'application/json; charset=utf-8',
          success: function(result) {
            if (Array.isArray(result.g)) {
              var arr = [];
              result.g.forEach(function(item) {arr.push(item.q);});
              hot_click(arr);
            } else {
              _this.els.hotList.hide();
            }
          }
        });
      }, 500);
    });
    this.els.button.click(function() {
      push_search(_this.els.input.val().trim()); /* 搜索按钮 */
    });
    $(document).click(function() {
      _this.els.pickerList.hide();
      _this.els.hotList.hide();
    });
  }
};
helangSearch.init();