import $ from "jquery";
// import pinch from "touch-pinch";

import {
  Plugin
} from "../../framework/jquery/plugins/plugins";
import {MaskedPaintCanvas} from "./lib/PaintCanvas";
import "./paint-bg/paint-bg";
import "./paint-brush/paint-brush";
import "./paint-color/paint-color";
import "./paint-eraser/paint-eraser";
import "./paint-size/paint-size";
import {$body, $window} from "../../dom";
import {api} from "../../framework/api/api";
import {showModal} from "../../framework/modal/modal";
import {navigate} from "../custom-page/custom-page";
import "../utils/swipe/swipe";
import {SCALE} from "../custom-data/custom-data";
import {is_iOS as isIOS} from "../utils/browser/browser";

export default class Paint extends Plugin {
  #isDragAndDrop;

  #isSaving;

  #dndInput;

  #spacebarDowned;

  $element;

  /**
   * @type {MaskedPaintCanvas}
   */
  paint;

  isSaved;

  constructor({$element, type}) {
    super($element);
    this.$element = $element;

    this.typeIdentifier = type.identifier
    this.paint = new MaskedPaintCanvas({
      // this.paint = new PaintCanvas({
      canvas: $element.find(".paint__canvas_view").get(0),
      drawCanvas: $element.find(".paint__canvas_draw").get(0),
      shadow: type.paint_image,
      mask: type.mask_image,
      // mouseEventTrigger: $element.get(0)
    });
    this.initShortcuts();
    $window.on("resize", this.onResize);

    // paint.setMask(base_url("images/mask/mask.svg"));
    // paint.setDistortionMap(base_url("images/mask/transform-mask.png"));

    $element.on("click", "[data-action]", ({currentTarget}) => {
      const action = $(currentTarget).data("action");
      switch (action) {
        case "save":
          this.save();
          break;
        default:
          this.paint[action]();
          break;
      }
    });

    this.#dndInput = $element.find(".paint__dnd input")
      .on("change", this.onDNDChange);

    this.initDragAndDrop();

    this.initTabs();
    this.paint.updateParams(getParams(["bg", "color", "opacity", "size", "brush", "erSize", "erOpacity"]));

    $element.on("paint-params:change", (e, value) => {
      this.#dndInput.prop("checked", false).change();
      this.paint.updateParams(value);
    });

    function getParams(list) {
      return list.map(name => {
        const n = name.replace(/[A-Z]/g, $0 => `_${$0.toLowerCase()}`);
        const res = {};
        $element.find(`input[name="${n}"]`).eq(0).trigger("input:getvalue", res);
        return res.exports;
      })
    }
  }

  onDNDChange = () => {
    this.updateDND();
  };

  updateDND() {
    if (this.#dndInput.is(":checked") || this.#spacebarDowned) {
      this.startDragAndDrop();
    } else {
      this.stopDragAndDrop();
    }
  }

  initShortcuts() {
    const SPACEBAR = 32;
    const Z = 90;
    const Y = 89;

    $window
      .on("keyup", (e) => {
        switch (true) {
          case e.keyCode === SPACEBAR:
            this.#spacebarDowned = false;
            this.updateDND();
            // this.stopDragAndDrop();
            break;
          default:
            break;
        }
      })
      .on("keydown", (e) => {
        switch (true) {
          case e.keyCode === SPACEBAR:
            this.#spacebarDowned = true;
            this.updateDND();
            // this.startDragAndDrop();
            break;
          case e.keyCode === Y && e.ctrlKey:
          case e.keyCode === Z && e.shiftKey && e.ctrlKey:
            this.paint.redo();
            break;
          case e.keyCode === Z && e.ctrlKey:
            this.paint.undo();
            break;
          default:
            break;
        }
      })
  }

  initDragAndDrop() {
    const self = this;
    const $container = this.$element.find(".paint__canvas-overflow");
    const $transformTarget = this.$element.find(".paint__canvas-wrap");
    const $transformTargetParent = $transformTarget.parent();
    $transformTarget.css("transform", `scale(${1 / SCALE})`);
    const $touchEvents = this.$element.find(".paint__canvas-overflow");
    const $scaleEvents = this.$element.find(".paint__scale");

    const offset = {x: 0, y: 0, scale: 1};
    const transform = {scale: 1, adaptiveScale: 1, x: 0, y: 0};
    const currentTransform = {scale: 1, x: 0, y: 0};
    let pivot;

    // pinch($touchEvents.get(0))
    //   .on("change", (distance, prevDistance) => {
    //     transform.scale += (distance - prevDistance) / 100;
    //     updateTransform();
    //   });


    $scaleEvents
      .on("paint-params:slide", onScale)
      .on("paint-params:change", onScaleEnd);

    $window.on("resize", onResize);
    onResize();

    this.startDragAndDrop = () => {
      if (!this.#isDragAndDrop) {
        this.#isDragAndDrop = true;
        this.paint.canPaint = false;

        $touchEvents
          .on("pep:touchstart", onTouchStart)
          .on("pep:touchmove", onTouchMove)
          .on("pep:touchend", onTouchEnd);
      }
    };

    this.stopDragAndDrop = () => {
      if (this.#isDragAndDrop) {
        this.#isDragAndDrop = false;
        this.paint.canPaint = true;

        $touchEvents
          .off("pep:touchstart", onTouchStart)
          .off("pep:touchmove", onTouchMove)
          .off("pep:touchend", onTouchEnd);
      }
    };

    function onResize() {
      transform.adaptiveScale = Math.min(1, $transformTargetParent.width() / $transformTarget.width() * SCALE);
      updateTransform();
    }

    function onScale(e, value) {
      if (!pivot) {
        pivot = getPivot();
        onTouchStart();
      }
      transform.scale = value.val / 100;

      const o = getPivotOffset(pivot);
      offset.x = o.x;
      offset.y = o.y;

      updateTransform();
    }

    function onScaleEnd(e) {
      pivot = undefined;
      e.stopPropagation();
      onTouchEnd();
    }

    function getPivot() {
      const cont = $container.get(0).getBoundingClientRect();
      const target = $transformTarget.get(0).getBoundingClientRect();
      return {
        scale: transform.scale,
        x: (cont.left + cont.width * 0.5) - (target.left + target.width * 0.5),
        y: (cont.top + cont.height * 0.5) - (target.top + target.height * 0.5),
      };
    }

    function getPivotOffset(p) {
      const o = {x: 0, y: 0};
      if (p) {
        o.x = -p.x * (transform.scale / p.scale - 1);
        o.y = -p.y * (transform.scale / p.scale - 1);
      }
      return o;
    }

    function onTouchStart() {
      offset.x = 0;
      offset.y = 0;
      offset.scale = 1;
    }

    function onTouchMove({touchmove}) {
      offset.x = touchmove.dx;
      offset.y = touchmove.dy;
      updateTransform();
    }

    function onTouchEnd() {
      transform.x += offset.x;
      transform.y += offset.y;
    }

    function updateTransform() {
      const x = transform.x + offset.x;
      const y = transform.y + offset.y;

      currentTransform.x = x;
      currentTransform.y = y;
      currentTransform.scale = transform.scale;
      $transformTarget.css("transform", `translate(${x}px, ${y}px) scale(${transform.scale * transform.adaptiveScale / SCALE})`);

      const cont = $container.get(0).getBoundingClientRect();
      const target = $transformTarget.get(0).getBoundingClientRect();
      if (cont.width >= target.width) {
        offset.x = -transform.x;
      } else {
        offset.x += Math.min(cont.left - target.left, Math.max(cont.right - target.right, 0));
      }
      if (cont.height >= target.height) {
        offset.y = -transform.y;
      } else {
        offset.y += Math.min(cont.top - target.top, Math.max(cont.bottom - target.bottom, 0));
      }

      $transformTarget.css("transform", `translate(${transform.x + offset.x}px, ${transform.y + offset.y}px) scale(${transform.scale * transform.adaptiveScale / SCALE})`);
      self.paint.setScale(transform.scale * transform.adaptiveScale / SCALE);
    }
  }

  isChanged() {
    return this.paint.isChanged();
  }

  save(redirect) {
    if (!this.#isSaving) {
      if (!this.isChanged()) {
        showModal("#message-modal", {
          "title": "Работа не сохранена",
          "text": "Работа без изменений не может быть сохранена"
        });
      } else {
        this.#isSaving = true;
        this.paint.getImage()
          .then(image => {
            api.send("/work/upload")({type: this.typeIdentifier, image})
              .then(() => {
                this.#isSaving = false;
                this.isSaved = true;
                showModal(
                  "#message-modal",
                  {
                    "title": "Работа сохранена",
                    "text": "Работа отправлена на&nbsp;модерацию! В&nbsp;случае успешной проверки она появится в&nbsp;галерее, ты&nbsp;сможешь поделиться ею&nbsp;с&nbsp;друзьями и&nbsp;принять участие в&nbsp;конкурсе!",
                    "sign": "Для получения уведомлений о&nbsp;статусе модерации работы необходимо подписаться на&nbsp;уведомления:"
                  }
                )
                  .on("modal:remove", navigate.factory(redirect || "gallery", !!redirect));
              })
              .catch((data) => {
                this.#isSaving = false;
                showModal(
                  "#message-modal",
                  {
                    "title": "Уведомление",
                    "text": data.message["limit:error"]
                  }
                ).on("modal:remove", () => (location.href = "gallery"));
              });
          });
      }
    }
  }

  initTabs() {
    const $pages = this.$element.find(".paint__block");
    const $inputs = this.$element.find(".paint__tab-input");
    const $tabs = this.$element.find(".paint__tab");

    this.$element.find(".paint__block-close-btn")
      .on("click", () => {
        $pages.removeClass("paint__block_selected-mob");
        $tabs.removeClass("paint__tab_selected");
      });

    const showTab = (pgName, className, checked) => {
      if (checked !== false) {
        $pages.each(i => {
          const $pg = $pages.eq(i);
          $pg.toggleClass(className || "paint__block_selected", $pg.data("paintBlock") === pgName);
        });
        const $selected = this.$element.find(".paint__block_selected");
        const $content = $selected.find(".custom-scroll__content");

        requestAnimationFrame(() => {
          if (isIOS) {
            $content.css("height", $selected.height());
          }

          $selected.find(".custom-scroll")
            .customScroll("update");

          this.$element.find(".paint__block_selected .paint-size")
            .add(this.$element.find(".paint__scale"))
            .paintSize("update");
        });
        this.paint.updateParams({name: "eraser", val: pgName === "eraser"});
      } else {
        const $content = this.$element.find(".paint__block_selected-mob .custom-scroll__content");
        if (isIOS) {
          $content.css("height", "");
        }
        $pages.removeClass("paint__block_selected-mob");
      }
    };

    let prevent;
    const onTabClick = e => {
      if (prevent) {
        return;
      }
      prevent = true;
      requestAnimationFrame(() => {
        prevent = false;
      });

      $tabs.not(e.currentTarget).removeClass("paint__tab_selected");
      const $tab = $tabs.filter(e.currentTarget).toggleClass("paint__tab_selected");
      showTab(
        $tab
          .find(".paint__tab-input")
          .val(),
        "paint__block_selected-mob",
        $tab.hasClass("paint__tab_selected")
      );
    };

    const onChangeTab = () => {
      const pgName = $inputs.filter(":checked").val();
      showTab(pgName);
      if ($body.hasClass("_app_ok"))
        showTab(pgName, "paint__block_selected-mob", true);
    };

    $inputs.on("change", onChangeTab);
    $tabs.on("click", onTabClick);

    onChangeTab();
  }

  onResize = () => {
    this.paint.resize();
  };
}

// registerPlugins({
//   name: "paint",
//   Constructor: Paint,
//   selector: ".paint"
// });
