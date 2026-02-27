<template>
  <div class="modal fade show" id="HistoryModal" style="display: block" role="dialog">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content bg-dark text-white border-white" dir="rtl">
        <div class="modal-header bg-dark text-white border-white d-flex justify-content-between align-items-center">
          <h4 class="modal-title mb-0">{{ t('modal.history.title') }}</h4>
        </div>
        <div class="modal-body p-0">
          <div v-if="formattedEvents.length === 0" class="text-center p-4">
            <p>{{ t('modal.history.noEvents') }}</p>
          </div>
          <div v-else class="accordion accordion-flush" id="historyAccordion">
            <div
              v-for="(event, index) in formattedEvents"
              :key="event.id"
              class="accordion-item"
            >
              <h2 class="accordion-header m-0">
                <button
                  class="accordion-button collapsed ps-3 pe-3"
                  type="button"
                  :data-bs-target="`#event-${event.id}`"
                  data-bs-toggle="collapse"
                >
                  <div class="w-100">
                    <div class="d-flex align-items-center justify-content-between flex-wrap">
                      <div class="flex-grow-1">
                        <span class="fw-bold">
                          {{ event.actionKey ? t(`actions.${event.actionKey}`) : event.actionName }}
                        </span>
                      </div>
                      <small class="text-muted ms-2" style="font-size: 0.8rem; white-space: nowrap">{{ event.displayTime }}</small>
                    </div>
                  </div>
                </button>
              </h2>
              <div
                :id="`event-${event.id}`"
                class="accordion-collapse collapse"
                :data-bs-parent="`#historyAccordion`"
              >
                <div class="accordion-body">
                  <div class="table-responsive">
                    <table class="table table-sm table-dark mb-0">
                      <thead>
                        <tr style="background-color: #495057">
                          <th style="font-size: 0.9rem" class="px-2">{{ t('players.name') }}</th>
                          <th style="font-size: 0.9rem" class="text-center">{{ t('modal.history.before') }}</th>
                          <th style="font-size: 0.9rem" class="text-center">{{ t('modal.history.after') }}</th>
                          <th style="font-size: 0.9rem" class="text-center">{{ t('modal.history.change') }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="change in event.playerChanges"
                          :key="change.playerId"
                          :class="getRowClass(change)"
                        >
                          <td class="px-2">{{ change.playerName }}</td>
                          <td class="text-center">{{ change.scoreBefore }}</td>
                          <td class="text-center">{{ change.scoreAfter }}</td>
                          <td class="text-center" :class="getScoreChangeClass(change.scoreChange)">
                            <strong>{{ change.scoreChange >= 0 ? '+' : '' }}{{ change.scoreChange }}</strong>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            style="width: 100px"
            @click="closeModal"
          >
            {{ t('modal.history.close') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { historyUtils } from '../historyUtils';

export default {
  props: {
    events: {
      type: Array,
      required: true
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const { t } = useI18n();

    const formattedEvents = computed(() => {
      return props.events.map((event) => historyUtils.formatEvent(event));
    });

    const translateSummary = (summary) => {
      if (summary === 'noChanges') {
        return t('modal.history.noChanges');
      }
      // Translate "added" and "removed" keys in the summary
      let translated = summary.replace(/ added/g, ` ${t('modal.history.added')}`);
      translated = translated.replace(/ removed/g, ` ${t('modal.history.removed')}`);
      return translated;
    };

    const getRowClass = (change) => {
      if (change.type === 'added') return 'table-success';
      if (change.type === 'removed') return 'table-danger';
      return '';
    };

    const getScoreChangeClass = (scoreChange) => {
      if (scoreChange > 0) return 'text-danger'; // More points = worse for player
      if (scoreChange < 0) return 'text-success'; // Negative points = good for player
      return '';
    };

    const closeModal = () => {
      emit('close');
    };

    return {
      t,
      formattedEvents,
      getRowClass,
      getScoreChangeClass,
      closeModal
    };
  }
};
</script>

<style scoped>
.modal.show {
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1050;
}

.modal-header {
  padding: 1.2rem;
}

.modal-body {
  max-height: 60vh;
  overflow-y: auto;
}

.accordion {
  background-color: transparent;
  border: none;
}

.accordion-item {
  background-color: transparent;
  border-bottom: 1px solid #495057;
}

.accordion-item:first-child {
  border-top: 1px solid #495057;
}

.accordion-button {
  background-color: #495057;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  transition: background-color 0.15s ease-in-out;
}

.accordion-button:not(.collapsed) {
  background-color: #5a6268;
  box-shadow: none;
  color: white;
}

.accordion-button:hover {
  background-color: #5a6268;
}

.accordion-button:focus {
  box-shadow: none;
  border-color: transparent;
  background-color: #5a6268;
  color: white;
}

.accordion-button::after {
  filter: brightness(0) invert(1);
  margin-start: auto;
  margin-end: 0;
}

.accordion-body {
  background-color: #343a40;
  padding: 0;
}

.table {
  margin-bottom: 0;
  background-color: #343a40;
}
</style>
