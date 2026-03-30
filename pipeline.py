"""Default pipeline configuration for piighost-chat."""

from gliner2 import GLiNER2
from piighost.anonymizer import Anonymizer
from piighost.detector.gliner2 import Gliner2Detector
from piighost.linker.entity import ExactEntityLinker
from piighost.pipeline.thread import ThreadAnonymizationPipeline
from piighost.placeholder import CounterPlaceholderFactory
from piighost.resolver.entity import MergeEntityConflictResolver
from piighost.resolver.span import ConfidenceSpanConflictResolver

model = GLiNER2.from_pretrained("fastino/gliner2-multi-v1")

pipeline = ThreadAnonymizationPipeline(
    detector=Gliner2Detector(
        model=model,
        labels=[
            "PERSON",
            "LOCATION",
            "ORGANIZATION",
            "EMAIL",
            "PHONE_NUMBER",
            "DATE_OF_BIRTH",
            "ADDRESS",
            "CREDIT_CARD",
            "IBAN",
            "PASSPORT_NUMBER",
            "SOCIAL_SECURITY_NUMBER",
            "IP_ADDRESS",
        ],
        threshold=0.5,
        flat_ner=True,
    ),
    span_resolver=ConfidenceSpanConflictResolver(),
    entity_linker=ExactEntityLinker(),
    entity_resolver=MergeEntityConflictResolver(),
    anonymizer=Anonymizer(CounterPlaceholderFactory()),
)
