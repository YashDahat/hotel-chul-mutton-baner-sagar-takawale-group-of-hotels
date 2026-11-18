package com.webappfoundation.site.workflow;

import com.webappfoundation.connector.builtin.EmailConnector;
import com.webappfoundation.connector.demo.DemoDeliveryConnector;
import com.webappfoundation.connector.demo.DemoRefundConnector;
import com.webappfoundation.dto.WorkflowDto;
import com.webappfoundation.model.RefundPolicy;
import com.webappfoundation.service.WorkflowService;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * The three real processes Hotel Chul Mutton runs: kitchen orders (pickup / delivery / team lunch), table
 * bookings and party (feast) requests. Idempotent via the fenced WorkflowService.defineWorkflow.
 */
@Component
@Order(10)
public class ChulWorkflowSeeder {

    public static final String CHUL_ORDER = "chul-order";
    public static final String TABLE_BOOKING = "table-booking";
    public static final String FEAST_ORDER = "feast-order";

    private final WorkflowService workflowService;

    public ChulWorkflowSeeder(WorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void seed() {
        workflowService.defineWorkflow(kitchen());
        workflowService.defineWorkflow(tables());
        workflowService.defineWorkflow(feast());
    }

    private WorkflowDto kitchen() {
        return WorkflowDto.builder().code(CHUL_ORDER).label("Chul kitchen orders").staffRole("Kitchen & dispatch").isDefault(true)
                .stages(List.of(
                        st("PLACED", "Order received", true, false, false, true, RefundPolicy.FULL, 5),
                        st("CONFIRMED", "Confirmed by the kitchen", false, true, false, true, RefundPolicy.FULL, 5,
                                bind(EmailConnector.ID, EmailConnector.EMAIL_CUSTOMER), bind(EmailConnector.ID, EmailConnector.EMAIL_STORE)),
                        st("ON_THE_CHUL", "On the chul", false, false, false, false, RefundPolicy.NONE, 25),
                        st("READY", "Packed & ready", false, false, false, false, RefundPolicy.NONE, 10,
                                bind(EmailConnector.ID, EmailConnector.EMAIL_CUSTOMER)),
                        st("OUT_FOR_DELIVERY", "On the way", false, false, false, false, RefundPolicy.NONE, 35,
                                bind(DemoDeliveryConnector.ID, DemoDeliveryConnector.DELIVERY_INITIATE),
                                bind(EmailConnector.ID, EmailConnector.EMAIL_CUSTOMER)),
                        st("COMPLETED", "Enjoy your meal", false, false, true, false, RefundPolicy.NONE, null,
                                bind(EmailConnector.ID, EmailConnector.EMAIL_CUSTOMER)),
                        st("CANCELLED", "Cancelled", false, false, true, false, RefundPolicy.NONE, null,
                                bind(EmailConnector.ID, EmailConnector.EMAIL_CUSTOMER),
                                bind(DemoRefundConnector.ID, DemoRefundConnector.REFUND_ISSUE))))
                .build();
    }

    private WorkflowDto tables() {
        return WorkflowDto.builder().code(TABLE_BOOKING).label("Table bookings").staffRole("Host desk").isDefault(false)
                .stages(List.of(
                        st("REQUESTED", "Request sent", true, false, false, true, RefundPolicy.NONE, 10),
                        st("CONFIRMED", "Table held for you", false, true, false, true, RefundPolicy.NONE, null,
                                bind(EmailConnector.ID, EmailConnector.EMAIL_CUSTOMER), bind(EmailConnector.ID, EmailConnector.EMAIL_STORE)),
                        st("SEATED", "Seated", false, false, false, false, RefundPolicy.NONE, 120),
                        st("COMPLETED", "Thanks for coming", false, false, true, false, RefundPolicy.NONE, null,
                                bind(EmailConnector.ID, EmailConnector.EMAIL_CUSTOMER)),
                        st("NO_SHOW", "Missed booking", false, false, true, false, RefundPolicy.NONE, null),
                        st("CANCELLED", "Cancelled", false, false, true, false, RefundPolicy.NONE, null,
                                bind(EmailConnector.ID, EmailConnector.EMAIL_CUSTOMER), bind(EmailConnector.ID, EmailConnector.EMAIL_STORE))))
                .build();
    }

    private WorkflowDto feast() {
        return WorkflowDto.builder().code(FEAST_ORDER).label("Party & bulk orders").staffRole("Catering lead").isDefault(false)
                .stages(List.of(
                        st("REQUESTED", "Request sent", true, false, false, true, RefundPolicy.NONE, 5),
                        st("RECEIVED", "We've got your request", false, true, false, true, RefundPolicy.NONE, 120,
                                bind(EmailConnector.ID, EmailConnector.EMAIL_CUSTOMER), bind(EmailConnector.ID, EmailConnector.EMAIL_STORE)),
                        st("QUOTED", "Quote shared", false, false, false, true, RefundPolicy.NONE, 1440,
                                bind(EmailConnector.ID, EmailConnector.EMAIL_CUSTOMER)),
                        st("BOOKED", "Booked in", false, false, false, true, RefundPolicy.NONE, null,
                                bind(EmailConnector.ID, EmailConnector.EMAIL_CUSTOMER)),
                        st("PREPARING", "On the chul", false, false, false, false, RefundPolicy.NONE, 180),
                        st("HANDED_OVER", "Handed over", false, false, true, false, RefundPolicy.NONE, null,
                                bind(EmailConnector.ID, EmailConnector.EMAIL_CUSTOMER)),
                        st("CANCELLED", "Cancelled", false, false, true, false, RefundPolicy.NONE, null,
                                bind(EmailConnector.ID, EmailConnector.EMAIL_CUSTOMER), bind(EmailConnector.ID, EmailConnector.EMAIL_STORE))))
                .build();
    }

    private static WorkflowDto.StageDto st(String code, String label, boolean initial, boolean onPaid, boolean terminal,
                                           boolean cancellable, RefundPolicy policy, Integer targetMinutes,
                                           WorkflowDto.BindingDto... bindings) {
        return WorkflowDto.StageDto.builder().code(code).label(label).initial(initial).onPaidEntry(onPaid).terminal(terminal)
                .cancellable(cancellable).refundPolicy(policy).targetMinutes(targetMinutes)
                .bindings(new ArrayList<>(List.of(bindings))).build();
    }

    private static WorkflowDto.BindingDto bind(String connectorId, String actionCode) {
        return WorkflowDto.BindingDto.builder().connectorId(connectorId).actionCode(actionCode).enabled(true).build();
    }
}
