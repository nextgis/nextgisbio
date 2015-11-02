<script>
    document.ngbioLoader = {
        htmlLoaderIndicator: null,
        init: function () {
            this.htmlLoaderIndicator = document.getElementById('loaderIndicator');
            return this;
        },
        interval: null,
        start: function () {
            var context = this;
            if (!this.htmlLoaderIndicator) return false;
            if (!this.interval) {
                this.interval = setInterval(function () {
                    context.start();
                }, 500);
            }
            var oldWidth = parseInt(this.htmlLoaderIndicator.style.width.split('%')[0], 10);
            if (oldWidth < 70) {
                this.htmlLoaderIndicator.style.width = (oldWidth + 5) + '%';
            }
        },
        stop: function () {
            clearInterval(this.interval);
            this.interval = null;
        }
    };
    document.ngbioLoader.init().start();
</script>