<!DOCTYPE html>

<html>

<?php include("../shared/header.php"); ?>

<body>

<section class="home-hero">
    <nav class="navbar" style="position: relative;">
        <div class="container">
            <div class="navbar-header">
                <button type="button" class="navbar-toggle collapsed" data-toggle="collapse"
                        data-target="#navbar" aria-expanded="false">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>

                <a href="/" class="navbar-brand">.feedback</a>
            </div>

            <!-- Collect the nav links, forms, and other content for toggling -->
            <div class="collapse navbar-collapse" id="navbar">
                <ul class="nav navbar-nav navbar-right">
                    <!--<li class="active"><a href="#">Packages</a></li>-->
                    <!--<li class="active"><a href="#">Customers</a></li>-->
                    <!--<li class="active"><a href="#">Pricing</a></li>-->
                    <!--<li class="active"><a href="#">Log In</a></li>-->
                    <li class="active"><a href="/registrars">Registrars</a></li>
                    <li class="active"><a href="/contact">Contact</a></li>
                    <li class="active"><a href="//www.myservice.feedback/login">Login</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="home-hero-top">
        <div class="container">
            <div class="row">
                <div class="col-lg-12">
                    <h1 class="section-headline" style="margin-bottom: 33px;">
                        <span class="shadow-text">Frequently Asked Questions</span>
                    </h1>
                </div>
            </div>
            <div class="row">
                <div class="panel">
                    <div class="panel-body" style="color: black;">
                        <section id="module-faq" class="module-contact text-inverse">
                            <ul>
                                <li>Jay was here</li>
                            </ul>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="home-hero-bottom" style="">
        <div class="module-customer-logos" style="">

            <?php include("../shared/footer.html"); ?>

        </div>
    </div>
</section>

<script type="application/javascript" src="//cdn.feedback/js/jquery-1.11.2.js"></script>
<script type="application/javascript" src="//cdn.feedback/js/bootstrap-3.3.5.js"></script>

</body>
</html>
