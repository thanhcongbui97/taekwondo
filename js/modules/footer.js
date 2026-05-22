class CustomFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
<!--Footer-->
<!--Footer-->
<footer class="page-footer font-small rgba-black-strong pt-4 mt-4">

      <!--Footer Links-->
      <!--Footer Links-->
<div class="container mt-5 mb-4 text-center text-md-left">
    <div class="row mt-3">

        <!--First column-->
        <div class="col-md-3 col-lg-4 col-xl-3 mb-4">
            <h6 class="text-uppercase font-weight-bold">
                <strong>CLB Taekwondo - PTIT</strong>
            </h6>
            <hr class="deep-purple accent-2 mb-4 mt-0 d-inline-block mx-auto" style="width: 200px;">
            <p>Là CLB sinh viên trực thuộc đoàn thanh niên của Học viện Công nghệ Bưu chính Viễn thông. Với khát vọng là một CLB võ thuật chuyên nghiệp chúng tôi đã không ngừng đổi mới và phát triển CLB với slogan:<br> “thắp lửa đam mê, giữ lửa nhiệt huyết”</p>
        </div>
        <!--/.First column-->

        <!--Second column-->
        <div class="col-md-2 col-lg-2 col-xl-2 mx-auto mb-4">
            <h6 class="text-uppercase font-weight-bold">
                <strong>information</strong>
            </h6>
            <hr class="deep-purple accent-2 mb-4 mt-0 d-inline-block mx-auto" style="width: 60px;">
            <p>
                <a href="bandieuhanh.html">Ban điều hành</a>
            </p>
            <p>
                <a href="#!">Ban huấn luyện</a>
            </p>
            <p>
                <a href="#!">Trang thiết bị</a>
            </p>
            <p>
                <a href="#!">Các tiểu ban</a>
            </p>
        </div>
        <!--/.Second column-->

        <!--Third column-->
        <div class="col-md-3 col-lg-2 col-xl-2 mx-auto mb-4">
            <h6 class="text-uppercase font-weight-bold">
                <strong>Useful links</strong>
            </h6>
            <hr class="deep-purple accent-2 mb-4 mt-0 d-inline-block mx-auto" style="width: 60px;">
            <p>
                <a href="#!">Your Account</a>
            </p>
            <p>
                <a href="#!">Become an Affiliate</a>
            </p>
            <p>
                <a href="#!">Shipping Rates</a>
            </p>
            <p>
                <a href="#!">Help</a>
            </p>
        </div>
        <!--/.Third column-->

        <!--Fourth column-->
        <div class="col-md-4 col-lg-3 col-xl-3">
            <h6 class="text-uppercase font-weight-bold">
                <strong>Thông tin liên hệ</strong>
            </h6>
            <hr class="deep-purple accent-2 mb-4 mt-0 d-inline-block mx-auto" style="width: 200px;">
            <p>
                <i class="fa fa-home mr-3"></i> Km 10, đường Nguyễn Trãi, quận &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbspThanh Xuân, Hà Nội </p>
            <p>
                <i class="fa fa-envelope mr-3"></i> taekwondo.ptit@gmail.com</p>
            <p>
                <i class="fa fa-phone mr-3"></i> 086 656 7902</p>
            <p>
                <i class="fa fa-facebook mr-3"></i> CLB Taekwondo - PTIT
                <a class="nav-link" href="https://www.facebook.com/messages/t/310527119066641"><i class="CLB Taekwondo - PTIT"></i></a>
            </p>
        </div>
        <!--/.Fourth column-->

    </div>
</div>

<!--Footer-->
<footer class="page-footer font-small blue">
    <!-- Social buttons -->
    <div class="primary-color">
        <div class="container">
            <!--Grid row-->
            <div class="row py-4 d-flex align-items-center">

                <!--Grid column-->
                <div class="col-md-6 col-lg-5 text-center text-md-left mb-4 mb-md-0">
                    <h6 class="mb-0 white-text">Get connected with us on social networks!</h6>
                </div>
                <!--Grid column-->

                <!--Grid column-->
                <div class="col-md-6 col-lg-7 text-center text-md-right">
                    <!--Facebook-->
                    <a class= "fb-ic" "nav-link" href="https://www.facebook.com/taekwondo.ptit">
                        <i class="fa fa-facebook white-text mr-4"> </i>
                    </a>
                    <!--Youtube-->
                    <a class="yt-ic" "nav-link" href="https://www.youtube.com/c/PTITTaekwondo/featured">
                        <i class="fa fa-youtube-play white-text mr-4"> </i>
                    </a>
                    <!--Google +-->
                    <a class="gplus-ic" href="taekwondo.ptit@gmail.com">
                        <i class="fa fa-google-plus white-text mr-4"> </i>
                    </a>
                    <!--Messenger-->
                    <a class="ins-ic" "nav-link" href="https://www.tiktok.com/@_taekwondo.ptit">
                        <i class="fab fa-tiktok white-text mr-4"> </i>
                    </a>
                    <!--Instagram-->
                    <a class="ins-ic" "nav-link" href="https://www.instagram.com/taekwondo.ptit/">
                        <i class="fa fa-instagram white-text mr-lg-4"> </i>
                    </a>
                </div>
                <!--Grid column-->

            </div>
            <!--Grid row-->
        </div>
    </div>
    <!-- Social buttons -->

    <!--Footer Links-->


              <!--First column-->

      <!--/.Footer Links-->

      <!--Copyright-->
      <!--Footer-->
<footer class="page-footer unique-color-dark pt-0">
          © 2026 Copyright:
          <a href="#"> Taekwondo-PTIT dev team </a>
      </div>
      <!--/.Copyright-->
</footer>
<!--/.Footer-->
<!--Footer-->
        `;
    }
}

// Footer Register
customElements.define('my-footer', CustomFooter);