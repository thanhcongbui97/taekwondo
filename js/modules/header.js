class CustomHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
              <header>
    <!--Navbar-->

    <nav class="navbar navbar-expand-lg navbar-dark fixed-top scrolling-navbar">

        <div class="container">

            <!-- Navbar brand -->
            <a class="navbar-brand" href="#">Taekwondo - PTIT</a>

            <!-- Collapse button -->
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#basicExampleNav" aria-controls="basicExampleNav"
                aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <!-- Collapsible content -->
            <div class="collapse navbar-collapse" id="basicExampleNav">

                <!-- Links -->

<ul class="navbar-nav mr-auto smooth-scroll">
                    <li class="nav-item active">
                        <a class="nav-link" href="index.html">Trang chủ
                            <span class="sr-only">(current)</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="http://quiz.taek.cf">Training</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="signup.html">Tuyển sinh</a>
                    </li>

                    <!-- Dropdown -->
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" id="navbarDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Mục lục</a>
                        <div class="dropdown-menu dropdown-primary" aria-labelledby="navbarDropdownMenuLink">
                            <a class="dropdown-item" href="#">Thi lên đai</a>
                            <a class="dropdown-item" href="#">Sự kiện</a>
                            <a class="dropdown-item" href="#">Confesions</a>
                            <a class="dropdown-item" href="#">Tiểu sử</a>
                        </div>
                    </li>

                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" id="navbarDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Thông tin</a>
                        <div class="dropdown-menu dropdown-primary" aria-labelledby="navbarDropdownMenuLink">
                            <a class="dropdown-item" href="#">Quy định</a>
                            <a class="dropdown-item" href="vophuc.html">Võ phục</a>
                            <a class="dropdown-item" href="demo.html">Chương trình học</a>
                            <a class="dropdown-item" href="thanhvien.html">Thành viên</a>
                            <a class="dropdown-item" href="quanli.html">Quản lý thông tin</a>
                            <a class="dropdown-item" href="ghepdoi.html">Ghép đôi</a>
                            <a class="dropdown-item" href="spinwheel.html">Vòng quay may mắn</a>
                        </div>
                    </li>
                </ul>
                <!-- Links -->

                <form class="form-inline">
                    <div class="md-form mt-0">
                        <input class="form-control mr-sm-2" type="text" placeholder="Search" aria-label="Search">
                    </div>
                </form>
            </div>
            <!-- Collapsible content -->
            <!-- Social Icon  -->
            <ul class="navbar-nav nav-flex-icons">
                <li class="nav-item">
                    <a class="nav-link" href="https://www.facebook.com/taekwondo.ptit"><i class="fa fa-facebook"></i></a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="https://www.youtube.com/c/PTITTaekwondo/featured"><i class="fa fa-youtube-play"></i></a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="https://www.instagram.com/taekwondo.ptit/"><i class="fa fa-instagram"></i></a>
                </li>
            </ul>
        </div>
    </nav>
    <!--Mask-->
<div id="intro" class="view">

  <!--Mask-->
  <div id="intro" class="view">

      <div class="mask rgba-black-strong">

          <div class="container-fluid d-flex align-items-center justify-content-center h-100">

              <div class="row d-flex justify-content-center text-center">

                  <div class="col-md-10">

                      <!-- Heading -->
                      <h2 class="display-4 font-weight-bold white-text pt-5 mb-2">Welcome to Taekwondo-PTIT</h2>

                      <!-- Divider -->
                      <hr class="hr-light">

                      <!-- Description -->
                      <h4 class="white-text my-4">CLB võ thuật của Học viện Công nghệ Bưu chính Viễn thông</h4>
                      <a href="login.html#Đăng nhập" class="btn btn-outline-white">Quản lý thông tin <i class="fa fa-book ml-2"></i></a>
                  </div>

              </div>

          </div>

      </div>

  </div>
  <!--/.Mask-->

</div>
<!--/.Mask-->
    <!--/.Navbar-->
  </header>
        `;
    }
}

// Header register
customElements.define('my-header', CustomHeader);