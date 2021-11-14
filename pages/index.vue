<template>
  <div class="cursor-[none] select-none">
    <div v-if="isJoined">
      <custom-cursor
        :mouseX="mouseX"
        :mouseY="mouseY"
        v-bind:style="{ color: color }"
        :isAnimated="false"
      />
    </div>

    <div>
      <custom-cursor
        v-for="remoteCursor in remoteCursors"
        :key="remoteCursor.userId"
        :mouseX="remoteCursor.x"
        :mouseY="remoteCursor.y"
        v-bind:style="{ color: remoteCursor.color }"
        :isAnimated="true"
      />
    </div>

    <!-- 'Made with Appwrite' badge -->
    <a
      href="https://appwrite.io/"
      target="_blank"
      style="position: fixed; right: 18px; bottom: 18px; z-index: 999"
    >
      <img
        style="width: 160px"
        src="https://appwrite.io/images-ee/press/badge-pink-button.svg"
        alt="Built with Appwrite"
      />
    </a>

    <!-- Design circle -->
    <svg
      class="absolute right-0 top-0 transform scale-150"
      width="377"
      height="567"
      viewBox="0 0 377 567"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M106.377 170.609C89.7135 72.8625 28.5159 16.142 0 0H460V567C440.163 557.811 257.238 489.413 180.841 402.629C131.447 346.52 127.206 292.791 106.377 170.609Z"
        fill="url(#paint0_linear_286_1339)"
        fill-opacity="0.05"
      />
      <defs>
        <linearGradient
          id="paint0_linear_286_1339"
          x1="-46"
          y1="156"
          x2="523.135"
          y2="-56.1372"
          gradientUnits="userSpaceOnUse"
        >
          <stop />
          <stop offset="1" stop-color="white" />
        </linearGradient>
      </defs>
    </svg>

    <!-- Design wave -->
    <svg
      class="absolute left-0 bottom-0 transform scale-150"
      width="310"
      height="194"
      viewBox="0 0 310 194"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="118.5"
        cy="191.5"
        r="191.5"
        fill="url(#paint0_linear_286_1339)"
        fill-opacity="0.05"
      />
      <defs>
        <linearGradient
          id="paint0_linear_286_1339"
          x1="-46"
          y1="156"
          x2="523.135"
          y2="-56.1372"
          gradientUnits="userSpaceOnUse"
        >
          <stop />
          <stop offset="1" stop-color="white" />
        </linearGradient>
      </defs>
    </svg>

    <!-- Connecting alert -->
    <div class="container mx-auto flex justify-center">
      <div
        class="
          rounded-md
          shadow-lg
          mt-4
          w-[fit-content]
          bg-white
          p-4
          text-center
        "
      >
        {{
          isJoined ? "Connected! Let's move mouse and click." : "Connecting ..."
        }}
      </div>
    </div>

    <!-- Center container -->
    <div class="absolute inset-0 flex items-center justify-center">
      <div class="text-center">
        <h1 class="font-bold text-gray-900 text-6xl">Realtime Playground</h1>
        <h2 class="text-gray-600 text-4xl mt-6">
          made with
          <span class="font-bold text-[#f02e65]">Appwrite</span>
        </h2>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import customCursor from "~/components/custom-cursor.vue";
import { AppwriteService, AppwriteServiceData } from "~/services/appwrite";
import Vue from "vue";

type ComponentData = {
  isJoined: boolean;
  mouseX: number;
  mouseY: number;
  color: string;

  remoteCursors: {
    userId: string;
    x: number;
    y: number;
    color: string;
    lastActionTimestamp: number;
  }[];

  lastClickCommit: number;
  isCommitingClick: boolean;
};

export default Vue.extend({
  components: { customCursor },
  data() {
    return {
      isJoined: false,
      mouseX: -100,
      mouseY: -100,
      color: "#f02e65",

      remoteCursors: [],

      lastClickCommit: -1,
      isCommitingClick: false,
    } as ComponentData;
  },
  async mounted() {
    await AppwriteService.initAccount();

    this.color = AppwriteServiceData.cursorColor || "#f02e65";

    const _cleanupInterval = setInterval(() => {
      const dateNow = Date.now();

      this.remoteCursors = this.remoteCursors.filter((cursor) => {
        if (Math.abs(dateNow - cursor.lastActionTimestamp) >= 10000) {
          return false;
        }

        return true;
      });
    }, 5000);

    const movementCommitInterval = async () => {
      await AppwriteService.pushMouseAction("move", this.mouseX, this.mouseY);

      setTimeout(() => {
        movementCommitInterval();
      }, 100);
    };

    movementCommitInterval();

    const onMouseMove = async (e: MouseEvent) => {
      this.mouseX = e.pageX;
      this.mouseY = e.pageY;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseover", onMouseMove);
    window.addEventListener("mouseenter", onMouseMove);

    window.addEventListener("mousedown", async (e) => {
      this.confetti({
        x: this.mouseX,
        y: this.mouseY,
        color: this.color,
      });

      if (!this.isCommitingClick) {
        const timeDifference = Math.abs(this.lastClickCommit - Date.now());
        if (timeDifference > 200) {
          this.isCommitingClick = true;

          await AppwriteService.pushMouseAction(
            "click",
            this.mouseX,
            this.mouseY
          );

          this.lastClickCommit = Date.now();
          this.isCommitingClick = false;
        }
      }
    });

    AppwriteService.registerListener((payload) => {
      if (!document.hasFocus()) {
        return;
      }

      if (payload.event !== "database.documents.update") {
        return;
      }

      if (payload.payload.userId === AppwriteServiceData.accountId) {
        return;
      }

      const userId = payload.payload.userId;

      if (payload.payload.lastAction === "move") {
        const userCursor = this.remoteCursors.find((c) => c.userId === userId);
        const pos = payload.payload.cursorPos.split(";");

        if (userCursor) {
          userCursor.x = +pos[0];
          userCursor.y = +pos[1];
          userCursor.lastActionTimestamp = Date.now();
        } else {
          this.remoteCursors.push({
            userId,
            x: +pos[0],
            y: +pos[1],
            color: payload.payload.color,
            lastActionTimestamp: Date.now(),
          });
        }
      } else if (payload.payload.lastAction === "click") {
        const pos = payload.payload.clickPos.split(";");
        this.confetti({
          x: +pos[0],
          y: +pos[1],
          color: payload.payload.color,
        });
      }
    });

    this.isJoined = true;
  },

  methods: {
    createElements(color: string, root: HTMLDivElement, elementCount: number) {
      return Array.from({ length: elementCount }).map((_, index) => {
        const element: HTMLDivElement = document.createElement("div");
        element.classList.add("fetti");
        element.style.backgroundColor = color;
        element.style.width = "10px";
        element.style.height = "10px";
        element.style.borderTopLeftRadius = "10px";
        element.style.borderTopRightRadius = "8px";
        element.style.borderBottomLeftRadius = "6px";
        element.style.borderBottomRightRadius = "12px";
        element.style.position = "absolute";
        element.style.left = "50%";
        element.style.top = "50%";
        element.style.opacity = "1";
        root.appendChild(element);
        return element;
      });
    },

    randomPhysics(angle: number, spread: number, startVelocity: number) {
      const radAngle = angle * (Math.PI / 180);
      const radSpread = spread * (Math.PI / 180);
      return {
        x: 0,
        y: 0,
        wobble: Math.random() * 10,
        velocity:
          startVelocity * 0.65 + Math.max(Math.random(), 0.35) * startVelocity,
        angle2D: -radAngle + (0.5 * radSpread - Math.random() * radSpread),
        angle3D: -(Math.PI / 4) + Math.random() * (Math.PI / 2),
        tiltAngle: Math.random() * Math.PI,
      };
    },

    updateFetti(fetti: any, progress: number, decay: number) {
      fetti.physics.x +=
        Math.cos(fetti.physics.angle2D) * fetti.physics.velocity;
      fetti.physics.y +=
        Math.sin(fetti.physics.angle2D) * fetti.physics.velocity;
      fetti.physics.z +=
        Math.sin(fetti.physics.angle3D) * fetti.physics.velocity;
      fetti.physics.wobble += 0.05;
      fetti.physics.velocity *= decay;
      fetti.physics.y += 3;
      fetti.physics.tiltAngle += 30.1;

      const { x, y, tiltAngle, wobble } = fetti.physics;
      const wobbleX = x + 10 * Math.cos(wobble);
      const wobbleY = y + 10 * Math.sin(wobble);
      const transform = `translate3d(${wobbleX}px, ${wobbleY}px, 0) rotateZ(${tiltAngle}deg)`;

      fetti.element.style.transform = transform;
      fetti.element.style.opacity = Math.min(1 - progress * 4.2, 100 - y);
    },

    animate(root: HTMLDivElement, fettis: any[], decay: number) {
      const totalTicks = 50;
      let tick = 0;

      const self = this;

      function update() {
        fettis.forEach((fetti) =>
          self.updateFetti(fetti, tick / totalTicks, decay)
        );

        tick += 1;
        if (tick < totalTicks) {
          requestAnimationFrame(update);
        } else {
          fettis.forEach((fetti) => root.removeChild(fetti.element));
        }
      }

      requestAnimationFrame(update);
    },

    confetti({
      x = -1000,
      y = -1000,
      color = "#f02e65",
      angle = 90,
      decay = 0.88,
      spread = 50,
      startVelocity = 15,
      elementCount = 3,
    } = {}) {
      const element: HTMLDivElement = document.createElement("div");
      element.style.position = "absolute";
      element.style.left = x + "px";
      element.style.top = y + 25 + "px";
      document.body.appendChild(element);

      const elements = this.createElements(color, element, elementCount);
      const fettis = elements.map((element) => ({
        element,
        physics: this.randomPhysics(angle, spread, startVelocity),
      }));

      this.animate(element, fettis, decay);
    },
  },
});
</script>