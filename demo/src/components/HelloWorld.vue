<template>
  <div class="demo">
    <div class="nav">
        <!-- <li style="line-height: 100px;"> 第一个</li>
         <li>
           <span >icont图</span>
           <span>一级导航</span>

         </li>
        <li id="nav-one">
          <span>icont图</span>
          <span>全场物料</span>
        </li>
        <li>
          <span>icont图</span>
          <span>一级导航</span>
        </li> -->
        <p class="img">
          我是图片
        </p>
        <ul class="navs">
          <li>
            <span >icont图</span>
            <p>设备管理
              <ul class="navs-yi">
                <li>基础数据</li>
                <li>采购单</li>
                <li>采购收货计划</li>
                <li>采购收料凭证</li>
                <li>标签生成和打印</li>
                <li>采购过账</li>
              </ul>
            </p>
          </li>
          <li>
            <span >icont图</span>
            <p>采购收料
            <ul class="navs-yi">
              <li>基础数据2</li>
             <router-link to="/wl"> <li>物料管理</li></router-link>
              <li>采购收货计划2</li>
              <li>采购收料凭证2</li>
              <li>标签生成和打印2</li>
              <li>采购过账2</li>
            </ul></p>
          </li>
          <li>
            <span >icont图</span>
            <p>质量管理</p>
          </li>
          <li>
            <span >icont图</span>
            <p>生产管理</p>
          </li>
        </ul>
    </div>
    <!-- <div id="show">
      <div id="show-one">
        <li>物料管理</li>
        <li>仓库管理</li>
      </div>
    </div> -->
  <div class="article">
    <h3>仓库管理</h3>
    <p></p>
    <table class="tab" cellspacing="0" border="1">
    <tr>
      <td>序号</td>
      <td>仓库编号</td>
      <td>仓库名称</td>
      <td>仓库类型</td>
    </tr>
    <tr>
      <td>1</td>
      <td>仓库编号</td>
      <td>仓库名称</td>
      <td>仓库类型</td>
    </tr>
    <tr>
      <td>2</td>
      <td>仓库编号</td>
      <td>仓库名称</td>
      <td>仓库类型</td>
    </tr>
    <tr>
      <td>3</td>
      <td>仓库编号</td>
      <td>仓库名称</td>
      <td>仓库类型</td>
    </tr>
    <tr>
      <td></td>
      <td>仓库编号</td>
      <td>仓库名称</td>
      <td>仓库类型</td>
    </tr>
  </table>
  </div>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {

    }

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2,h3,h4,h5,h6 {
  font-weight: normal;
}
.nav{
    min-height: 800px;
    width: 180px;
    /* margin-left: 5px; */
    background-color: rgba(54, 62, 79, 1);
    position: relative;
}
.img{
  color: white;
  height:88px;
  width: 180px;
 text-align: center;
  line-height: 88px;
  /* margin-left: 30px; */
  border-bottom: 1px solid red;
}
.navs{
  height:88px;
  width: 180px;
   margin-left: -40px;
}
.navs>li{
  list-style-type:none;
  height:88px;
  width: 100%;
  text-align: center;
  /* color: white; */
}
.navs>li:hover{
  background: #0094FF;
  /* color:#fff; */
}
.navs>li:hover .navs-yi{
  display:block;
}
.navs>li>span{
  display: inline-block;
  margin-top: 20px;
}
.navs-yi{
  list-style-type:none;
  display: none;
  position: absolute;
  top:0px;
  left: 140px;
  /* background: red; */
  width: 150px;
  height: 800px;
}
.navs-yi>li{
  width:100%;
  height:40px;
  line-height:40px;
  text-align: center;
  /* background:#0086B3; */
}
.navs-yi>li:hover{
  background: #0086B3;
  color:#fff;
}
/* #show-one li{
  width:100%;
  height:60px;
  line-height: 60px;
  text-align: center;
}
#show-one{
  display: none;
}
h3{
  width:100%-50px;
  height:50px;
  line-height:50px;
  padding-left:50px;
  font-weight: bold;
  border:1px solid  #6C6C6C;
}
li{
  list-style:none;
  width:200px;
  height:100px;
  text-align: center;
}
.demo{
  position:relative;
  min-height:800px;
}
p{
  width:100%;
  height:50px;
  background: #CDCDCD;
  border:1px solid #6C6C6C;
  margin-top:-20px;
}
.nav span
  display:block;
}
.nav span:nth-child(1){
  height:50px;line-height:50px;text-align: center;
}
.nav{
  background:#202020;
  color:#FFFFFF;
   width:200px;
  min-height:800px;
}
li:hover{
  background: #0094FF;
}
 #nav-one:hover #show #show-one{
  display:block;
} */
/* #show{
  width:200px;
  background: #0086B3;
  border:1px solid #C0C4CC;
  min-height: 100%;
  position:absolute;
  left:200px;
  top:0;
} */
.article{
  width:100%;
  min-height:100%;
  /* float:left; */
  position: absolute;
  left:350px;
  top:0;
  padding-top:50px;
}
.tab{
  width:100%;
}
.tab td{
  border:1px solid #6C6C6C;
  text-align: center;
}
.tab tr:nth-child(1) td:nth-child(1){
  width:60px;
  height:50px;
  line-height: 50px;
}
.tab tr:nth-child(2) td:nth-child(2),.tab tr:nth-child(3) td:nth-child(3){
  height:70px;
  line-height: 70px;
}
</style>
